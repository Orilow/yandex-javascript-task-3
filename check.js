'use strict';

const checker = {
    isObject(obj) {
        return typeof obj === 'object';
    },

    isString(obj) {
        return typeof obj === 'string';
    },

    isFunction(obj) {
        return typeof obj === 'function';
    },

    isNull(obj) {
        return obj === null;
    },

    objectContainsKeys(keys) {
        if (!checker.isObject(this) || checker.isNull(this)) {
            return false;
        }

        const noRepeatKeys = new Set(keys);
        const thisKeys = Object.keys(this);

        return Array.from(noRepeatKeys).every(key => thisKeys.includes(key));
    },

    objectHasKeys(keys) {
        if (!checker.isObject(this) || checker.isNull(this)) {
            return false;
        }

        return Object.keys(this).length === keys.length &&
            checker.objectContainsKeys.call(this, keys);
    },

    objectContainsValues(values) {
        if (!checker.isObject(this) || checker.isNull(this)) {
            return false;
        }
        const thisValues = Object.values(this);
        for (let val of values) {
            if (!thisValues.includes(val)) {
                return false;
            }
        }

        return true;
    },

    objectHasValueType(key, type) {
        function hasValueType(context) {
            switch (type) {
                case String:
                    return typeof context[key] === 'string';
                case Number:
                    return typeof context[key] === 'number';
                case Function:
                    return typeof context[key] === 'function';
                case Array:
                    return Array.isArray(context[key]);
                default:
                    return false;
            }
        }
        if (!checker.isObject(this) || checker.isNull(this)) {
            return false;
        }
        if (!this.hasOwnProperty(key)) {
            return false;
        }

        return hasValueType(this);
    },

    arrayOrStringHasLength(length) {
        return !checker.isString(this) && !Array.isArray(this) ? false : this.length === length;
    },

    objectHasValues(values) {
        if (!checker.isObject(this) || checker.isNull(this)) {
            return false;
        }
        const thisValues = Object.values(this);
        if (thisValues.length !== values.length) {
            return false;
        }
        for (let value of values) {
            if (!thisValues.includes(value)) {
                return false;
            }
        }

        return true;
    },

    functionHasParamsCount(count) {
        return !checker.isFunction(this) ? false : this.length === count;
    },

    stringHasWordCount(count) {
        return !checker.isString(this) ? false
            : this.split(/[\n ]/).filter((word) => word !== '').length === count;
    },

    inversed(func) {
        let context1 = this;

        return function () {
            const result = func.call(context1, ...arguments);

            return !result;
        };
    },


    checkBodies() {
        return {
            objectCheckMethods: {
                containsKeys: checker.objectContainsKeys.bind(this),
                hasKeys: checker.objectHasKeys.bind(this),
                containsValues: checker.objectContainsValues.bind(this),
                hasValues: checker.objectHasValues.bind(this),
                hasValueType: checker.objectHasValueType.bind(this)
            },

            additionalArrayCheckMethods: {
                hasLength: checker.arrayOrStringHasLength.bind(this)
            },

            stringCheckMethods: {
                hasLength: checker.arrayOrStringHasLength.bind(this),
                hasWordsCount: checker.stringHasWordCount.bind(this)
            },

            functionCheckMethods: {
                hasParamsCount: checker.functionHasParamsCount.bind(this)
            },

            nullCheckMethods: {
                isNull: checker.isNull.bind(this, this)
            },

            notForObject: {
                containsKeys: checker.inversed.call(this, checker.objectContainsKeys),
                hasKeys: checker.inversed.call(this, checker.objectHasKeys),
                containsValues: checker.inversed.call(this, checker.objectContainsValues),
                hasValues: checker.inversed.call(this, checker.objectHasValues),
                hasValueType: checker.inversed.call(this, checker.objectHasValueType)
            },

            notForArrayOrStringAdditional: {
                hasLength: checker.inversed.call(this, checker.arrayOrStringHasLength)
            },

            notForString: {
                hasWordsCount: checker.inversed.call(this, checker.stringHasWordCount)
            },

            notForFunction: {
                hasParamsCount: checker.inversed.call(this, checker.functionHasParamsCount)
            },

            notForNull: {
                isNull: checker.inversed.call(this, checker.isNull.bind(this, this))
            }
        };
    },

    buildChecker(checkObjs, notObjs) {
        const checkFor = checker.checkBodies.call(this);
        const checkObjsToAssign = checkObjs.map(name => checkFor[name]);
        const newCheckObj = Object.assign({}, ...checkObjsToAssign);
        const notObjsToAssign = notObjs.map(name => checkFor[name]);
        Object.defineProperty(newCheckObj, 'not', {
            get: () => Object.assign({}, ...notObjsToAssign)
        });

        return newCheckObj;
    }
};


exports.init = function () {
    Object.defineProperty(Object.prototype, 'check', {
        get() {
            return checker.buildChecker.call(this, ['objectCheckMethods'],
                ['notForObject']);
        }
    });

    Object.defineProperty(Array.prototype, 'check', {
        get() {
            return checker.buildChecker.call(this, ['objectCheckMethods',
                'additionalArrayCheckMethods'],
            ['notForObject', 'notForArrayOrStringAdditional']);
        }
    });

    Object.defineProperty(String.prototype, 'check', {
        get() {
            return checker.buildChecker.call(this, ['stringCheckMethods'],
                ['notForString', 'notForArrayOrStringAdditional']);
        }
    });

    Object.defineProperty(Function.prototype, 'check', {
        get() {
            return checker.buildChecker.call(this, ['functionCheckMethods'],
                ['notForFunction']);
        }
    });
};

exports.wrap = function (obj) {

    return checker.buildChecker.call(obj, ['objectCheckMethods', 'stringCheckMethods',
        'functionCheckMethods', 'additionalArrayCheckMethods',
        'nullCheckMethods'],
    ['notForObject', 'notForString', 'notForFunction',
        'notForArrayOrStringAdditional', 'notForNull']);
};
