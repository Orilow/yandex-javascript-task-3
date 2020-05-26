/* eslint-env mocha */
'use strict';

const assert = require('assert');

const check = require('./check');

check.init();

describe('Check', function () {
    const person = { name: 'John', age: 20 };
    const numbers = [1, 2, 3];
    const func = function (a, b) {
        return a + b;
    };
    const str = 'some string';

    it('should check that target hasKeys', function () {
        assert.ok(person.check.hasKeys(['name', 'age']));
    });

    it('should check that target hasValueType', function () {
        assert.ok(person.check.hasValueType('name', String));
    });

    it('should check that target hasKeys', function () {
        assert.ok(numbers.check.hasKeys(['0', '1', '2']));
    });

    it('should check that target hasLength', function () {
        assert.ok(numbers.check.hasLength(3));
    });

    it('should check that target containsValues', function () {
        assert.ok(numbers.check.containsValues([2, 1]));
    });

    it('should check that target hasParamsCount', function () {
        assert.ok(func.check.hasParamsCount(2));
    });

    it('should check that target hasWordsCount', function () {
        assert.ok(str.check.hasWordsCount(2));
    });
});
