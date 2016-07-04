var spreadsheet = require('./index');

describe('sheetToJson()', function() {
	var fields = ['a:string', 'b:int', 'c:float', 'd:json'];
	var textInput = 'a\t3\t2.5\t{"a":2}\na\t3\t2.5\t{"a":2}';

	it('should work in normal cases', function() {
		var ans = spreadsheet.sheetToJson(textInput, fields);
		expect(ans.length).toBe(2);
		expect(ans[0].a).toBe('a');
		expect(ans[0].b).toBe(3);
		expect(ans[0].c).toBe(2.5);
		expect(ans[0].d.a).toBe(2);
	});

	it('benchmark 10000 lines', function() {
		var longText = [];
		for (var i = 0; i < 5000; i++)
			longText.push(textInput);
		var ans = spreadsheet.sheetToJson(longText.join('\n'), fields);
		expect(ans.length).toBe(10000);
	});

	it('should ignore empty lines and commented lines', function() {
		var ans = spreadsheet.sheetToJson('//comment\n' + textInput + '\n\n//abc\n', fields);
		expect(ans.length).toBe(2);
	});

	it('should handle \\r', function() {
		var ans = spreadsheet.sheetToJson(textInput.replace(/\n/g, '\r\n'), fields);
		expect(ans.length).toBe(2);
	});

	it('should ignore byte order mark', function() {
		var ans = spreadsheet.sheetToJson('\uFEFF' + textInput, fields);
		expect(ans.length).toBe(2);
		expect(ans[0].a).toBe('a');
	});

	it('should throw exception for invalid field spec', function() {
		try {
			spreadsheet.sheetToJson(textInput, ['a:strin', 'b:int', 'c:float', 'd:json']);
			expect(1).toBe(0);
		} catch (e) {
			expect(e.message).toMatch(/Incorrect error syntax:/);
		}
		try {
			spreadsheet.sheetToJson(textInput, ['a:string', 'b::int', 'c:float', 'd:json']);
			expect(1).toBe(0);
		} catch (e) {
			expect(e.message).toMatch(/Incorrect error syntax:/);
		}
	});

	it('should throw for unparsable input', function() {
		try {
			spreadsheet.sheetToJson('a\t3\t3.5\t{a:2}', fields);
			expect(1).toBe(0);
		} catch (e) {
			expect(e instanceof SyntaxError).toBe(true);
		}
		try {
			spreadsheet.sheetToJson('a\tbc\t3.5\t{"a":2}', fields);
			expect(1).toBe(0);
		} catch (e) {
			expect(e.message).toMatch(/Parsing NaN:/);
		}
		try {
			spreadsheet.sheetToJson('a\t3\tbc\t{"a":2}', fields);
			expect(1).toBe(0);
		} catch (e) {
			expect(e.message).toMatch(/Parsing NaN:/);
		}
	});

	it('should throw for excess fields', function() {
		try {
			spreadsheet.sheetToJson(textInput + '\t', fields);
			expect(1).toBe(0);
		} catch (e) {
			expect(e.message).toMatch(/Excess fields:/);
		}
	});

	it('should allow empty cell', function() {
		var ans = spreadsheet.sheetToJson(' a  b \t\t2.5\t{"a":2}', fields);
		expect(ans.length).toBe(1);
		expect(ans[0].b).toBe(undefined);
	});

	it('should trim normal space for every cell', function() {
		var ans = spreadsheet.sheetToJson(' a  b \t 3 \t2.5\t{"a":2}', fields);
		expect(ans.length).toBe(1);
		expect(ans[0].a).toBe('a  b');
		expect(ans[0].b).toBe(3);
	});
});


describe('jsonToSheet()', function() {
	it('should work in normal cases', function() {
		var columnOrder = ['a', 'b', 'c'];
		var jsonArray = [{ b: 'b', c: 2, a: [2, 3, 'hello'] }, { a: { b: 2 } }];
		var ans = spreadsheet.jsonToSheet(jsonArray, columnOrder, 'comment', 'a\tb\tc');
		expect(ans).toBe('//comment\n//a\tb\tc\n2,3,hello\tb\t2\n{"b":2}\t\t');
	});
});
