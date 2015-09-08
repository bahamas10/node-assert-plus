// ensure we do some real tests
delete process.env.NODE_NDEBUG;

var f = require('util').format;
var stream = require('stream');

var test = require('tape');

var assertPlus = require('../');


function capitalize(s) {
	return s[0].toUpperCase() + s.substr(1);
}

/**
 * Example JavaScript objects and primitives to test.  The keys of this object
 * will match the methods exported by the assert-plus module.
 *
 * The idea is to check all examples against their respective methods and ensure
 * they do NOT throw, and also check all examples against all other methods
 * and ensure that they DO throw.
 */
var examples = {
	bool: [
		false,
		true
	],
	buffer: [
		new Buffer(0),
		new Buffer('foo')
	],
	date: [
		new Date(),
		new Date(0)
	],
	func: [
		function () {},
		console.log
	],
	number: [
		-1,
		0,
		1,
		0.5,
		Math.PI
	],
	object: [
		{},
		console
	],
	regexp: [
		/foo/,
		new RegExp('foo')
	],
	stream: [
		new stream(),
		process.stdout
	],
	string: [
		'foo',
		'bar',
		'baz'
	],
	uuid: [
		'B3A4A7B5-11C3-449B-B46F-86C57AA99022',
		'76d26c04-d351-42b7-bba9-c130169cc162'
	]
};


// loop each example type
// ie: "func", "bool", "string", etc.
Object.keys(examples).forEach(function (type) {
	test(f('testing type "%s"', type), function (t) {
		// the array of `type` objects/primitives
		var arr = examples[type];

		// the type name capitalized
		var capType = capitalize(type);

		t.comment('testing methods that should pass');

		// loop each member of the array and test the corresponding
		// assert-plus method
		arr.forEach(function (o) {
			t.doesNotThrow(function () {
				assertPlus[type](o);
			}, f('assertPlus.%s(<%s>)', type, type));

			t.doesNotThrow(function () {
				assertPlus['optional' + capType](o);
			}, f('assertPlus.optional%s(<%s>)', capType, type));

			t.doesNotThrow(function () {
				assertPlus['optional' + capType](undefined);
			}, f('assertPlus.optional%s(<%s>)', capType, 'undefined'));
		});

		// test the entire array with arrayOf* and optionalArrayOf*
		// arrayOf*
		t.doesNotThrow(function () {
			assertPlus['arrayOf' + capType](arr);
		}, f('assertPlus.arrayOf%s([<%s>])', capType, type));

		// optionalArrayOf*
		t.doesNotThrow(function () {
			assertPlus['optionalArrayOf' + capType](arr);
		}, f('assertPlus.optionalArrayOf%s([<%s>, ...])', capType, type));

		t.doesNotThrow(function () {
			assertPlus['optionalArrayOf' + capType](undefined);
		}, f('assertPlus.optionalArrayOf%s([<%s>, ...])', capType, 'undefined'));

		t.comment('testing methods that should throw');

		// test against all other types and ensure the methods throw
		Object.keys(examples).forEach(function (_type) {
			// don't test against our own methods because they won't throw
			if (type === _type)
				return;

			// uuid's are strings
			if (type === 'uuid' && _type === 'string')
				return;

			// too many things are considered "objects", see
			// https://github.com/mcavage/node-assert-plus/issues/15
			if (_type === 'object')
				return;

			// the _type name capitalized
			var _capType = capitalize(_type);

			// loop each member of the array and test the corresponding
			// assert-plus method
			arr.forEach(function (o) {
				t.throws(function () {
					assertPlus[_type](o);
				}, f('assertPlus.%s(<%s>)', _type, type));

				t.throws(function () {
					assertPlus['optional' + _capType](o);
				}, f('assertPlus.optional%s(<%s>)', _capType, type));
			});

			// test the entire array with arrayOf* and optionalArrayOf*
			// arrayOf*
			t.throws(function () {
				assertPlus['arrayOf' + _capType](arr);
			}, f('assertPlus.arrayOf%s([<%s>, ...])', _capType, type));

			// optionalArrayOf*
			t.throws(function () {
				assertPlus['optionalArrayOf' + _capType](arr);
			}, f('assertPlus.optionalArrayOf%s([<%s>, ...])', _capType, type));
		});

		t.end();
	});
});
