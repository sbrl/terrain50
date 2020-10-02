"use strict";

import Terrain50 from '../Terrain50.mjs';
import Terrain50ValidationMessage from '../Terrain50ValidationMessage.mjs';


/**
 * Checks a Terrain50 string for errors.
 * Possible error messages:
 * 
 * Code		| Meaning
 * ---------|------------------------------------------------------------------
 * `TE001`	| Invalid number of elements on metadata header line
 * `TE002`	| Found unexpected metadata header line after X rows of data
 * `TE003`	| Data rows have differing numbers of columns
 * `TE004`	| Required metadata header not found
 * `TE005`	| Actual row count does not match metadata
 * `TE006`	| Actual column count does not match metadata
 * `TE007`	| No data rows detected
 * `TE008`	| Seen more than 1 column count
 * `TW001`	| Unknown metadata header key
 * `TW002`	| Invalid metadata header value
 * @example
 * import fs from 'fs';
 * import Terrain50 from 'terrain50';
 * let errors = Terrain50.Validate(fs.readFileSync("path/to/file.asc", "utf-8"));
 * @param	{string}	str	The source string to check.
 * @return	{Terrain50ValidationMessage[]}	A list of validation errors (if any) found.
 */
function terrain50_validate(str) {
	let errors = [];
	let line_number = -1;
	
	let col_count = null, col_counts_seen = [], row_count = 0, meta = {};
	for(let line of str.split(/\r?\n/)) {
		line_number++;
		
		line = line.trim();
		if(line.length == 0) continue;
		
		let parts = line.split(/\s+/);
		
		if(line.search(/^[0-9-.e]+\s+/) !== -1) {
			// It's a data line
			if(col_count === null) col_count = parts.length;
			if(!col_counts_seen.includes(parts.length))
				col_counts_seen.push(parts.length);
			
			if(parts.length !== col_count) {
				errors.push(new Terrain50ValidationMessage("error", "TE003",
					`Line ${line_number} (row ${row_count}) has ${parts.length} elements, when the previous line has ${col_count} elements.`
				));
			}
			col_count = parts.length;
			
			row_count++;
		}
		else {
			if(parts.length !== 2) {
				errors.push(new Terrain50ValidationMessage("error", "TE001",
					`Metadata header on line ${line_number} has ${line_number} elements - expecting exactly 2 (1 for the key, and another for the value).`
				));
				continue;
			}
			if(row_count > 0) {
				errors.push(new Terrain50ValidationMessage("error", "TE002",
					`Found unexpected metadata header on line ${line_number} after ${row_count} rows of data`
				));
			}
			
			let key = parts[0], value = parts[1];
			if(!Terrain50.ValidMetaHeaderKeys.includes(key)) {
				errors.push(new Terrain50ValidationMessage("warning", "TW001",
					`Unknown meta header key ${key}. Valid header keys: ${Terrain50.ValidMetaHeaderKeys.join(", ")}.`
				));
			}
			
			if(isNaN(parseFloat(value))) {
				errors.push(new Terrain50ValidationMessage("warning", "TW002",
					`Value of meta header key ${key} is invalid. Valid values should be parseable as a floating-point number.`
				));
			}
			
			meta[key] = parseFloat(value);
			
			// result.meta[] = parts[1].search(/^[0-9-.]+$/) == -1 ? parts[1] : parseFloat(parts[1]);
		}
	}
	
	Terrain50.RequiredMetaHeaderKeys.forEach((meta_key) => {
		if(typeof meta[meta_key] === "undefined") {
			errors.push(new Terrain50ValidationMessage("error", "TE004",
				`Required metadata header ${meta_key} not found.`
			));
		}
	})
	if(typeof meta["nrows"] !== "undefined" && meta["nrows"] !== row_count) {
		errors.push(new Terrain50ValidationMessage("error", "TE005",
			`Unexpected row count: Expected ${meta["nrows"]} rows from metadata, but found ${row_count} in data.`
		));
	}
	if(typeof meta["ncols"] !== "undefined" && meta["ncols"] !== col_count) {
		errors.push(new Terrain50ValidationMessage("error", "TE006",
			`Unexpected column count: Expected ${meta["ncols"]} columns from metadata, but found ${col_count} in data on the last line.`
		));
	}
	
	if(col_counts_seen.length === 0) {
		errors.push(new Terrain50ValidationMessage("error", "TE007",
			`No data rows detected.`
		));
	}
	
	if(col_counts_seen.length > 1) {
		errors.push(new Terrain50ValidationMessage("error", "TE008",
			`More than 1 data row element count detected (seen ${col_counts_seen.join(", ")} - but expected only 1 row element count)`
		));
	}
	
	return errors;
}

export default terrain50_validate;
