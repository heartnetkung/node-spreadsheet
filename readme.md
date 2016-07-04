## node-spreadsheet
Convert Array of JSON to a table of plain text separated by \\t and \\n. This plain text format can be copy-pasted to MS Excel and Google SpreadSheet.

#### sheetToJson(textInput, columns) return array of JSON
* Convert spreadsheet to JSON array.
* Any empty lines or lines starting with '//' are ignored.
* If the first character is \uFEFF, it is removed.
* Columns are json specifying the data types and data names. `example: ['columnName:int'] types can be (int|json|float|string)`

#### jsonToSheet(jsonArray, columnOrder, comment1, comment2, ....) return textOutput
* Convert JSON array to spreadsheet.
* Type conversion is dynamic based on what is inside the JSON array.
* Arrays are converted into string separated with comma.