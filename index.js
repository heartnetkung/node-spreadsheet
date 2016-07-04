//handle comment trim and split
var excelToArray = function(input) {
	var lines = input.split(/\r?\n/);
	if (lines[0][0] === '\uFEFF')
		lines[0] = lines[0].substr(1);
	var ans = [];
	for (var i = 0, ii = lines.length; i < ii; i++) {
		var current = lines[i].replace(/^ */g, '').replace(/ *$/g, '');
		if (current.substr(0, 2) === '//')
			continue;
		if (!current)
			continue;
		ans.push(current.split(/ *\t */));
	}
	return ans;
};


//fields: [{name:'hello',type:'string|int|json|float'}]
var arrayToJson = function(array, fields) {
	var ans = [];
	for (var i = 0, ii = array.length; i < ii; i++) {
		var current = array[i];
		var ansUnit = {};
		if (current.length > fields.length)
			throw new Error('Excess fields: ' + current);
		for (var j = 0, jj = fields.length; j < jj; j++) {
			if (!current[j])
				continue;
			switch (fields[j].type) {
				case 'string':
					ansUnit[fields[j].name] = current[j];
					break;
				case 'int':
					ansUnit[fields[j].name] = parseInt(current[j], 10);
					if (isNaN(ansUnit[fields[j].name]))
						throw new Error('Parsing NaN: ' + current[j]);
					break;
				case 'float':
					ansUnit[fields[j].name] = parseFloat(current[j]);
					if (isNaN(ansUnit[fields[j].name]))
						throw new Error('Parsing NaN: ' + current[j]);
					break;
				case 'json':
					ansUnit[fields[j].name] = JSON.parse(current[j]);
					break;
			}
		}
		ans.push(ansUnit);
	}
	return ans;
};

var parseFields = function(fields) {
	var ans = [];
	for (var i = 0, ii = fields.length; i < ii; i++) {
		var temp = fields[i].split(/\s*:\s*/);
		if (temp.length !== 2 || !/int|string|float|json/.test(temp[1]))
			throw new Error('Incorrect error syntax: ' + temp);
		ans.push({
			name: temp[0],
			type: temp[1]
		});
	}
	return ans;
};


exports.sheetToJson = function(input, fields) {
	return arrayToJson(excelToArray(input), parseFields(fields));
};


exports.jsonToSheet = function(jsonArray, fieldOrder /*,comments*/ ) {
	var ans = [];

	var comments = Array.prototype.slice.call(arguments, 2);
	for (var i = 0, ii = comments.length; i < ii; i++)
		ans.push('//' + comments[i]);

	for (var i = 0, ii = jsonArray.length; i < ii; i++) {
		var row = [];
		for (var j = 0, jj = fieldOrder.length; j < jj; j++) {
			var current = jsonArray[i][fieldOrder[j]];
			if (!current && current !== 0)
				row.push('');
			else if (typeof current === 'string' || typeof current === 'number')
				row.push(current);
			else if (Array.isArray(current))
				row.push(current.join(','));
			else
				row.push(JSON.stringify(current));
		}
		ans.push(row.join('\t'));
	}
	return ans.join('\n');
};
