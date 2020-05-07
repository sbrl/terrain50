"use strict";

import Terrain50 from '../Terrain50.mjs';

/**
 * Parses a Terrain50 instance from a string.
 * See https://en.wikipedia.org/wiki/Esri_grid for more information on the
 * supported format.
 * 
 * See also `Terrain50.Merge()` for merging multiple instances (format 
 * restrictions apply).
 * @example
 * import fs from 'fs';
 * import Terrain50 from 'terrain50';
 * let new_instance = Terrain50.Parse(fs.readFileSync("path/to/file.asc", "utf-8"));
 * @param	{string}	str		The string to parse
 * @return	{Terrain50}	The parsed string as a Terrain50 object.
 */
function terrain50_parse(str) {
	let result = new Terrain50();
	
	for(let line of str.split(/\r?\n/)) {
		line = line.trim();
		if(line.length == 0) continue;
		
		let parts = line.split(/\s+/); 
		
		if(line.search(/^[0-9-.]+\s+/) !== -1) {
			// It's a data line
			result.data.push(parts.map(parseFloat));
		}
		else {
			// It's a metadata line
			result.meta[parts[0]] = parts[1].search(/^[0-9-.]+$/) == -1 ? parts[1] : parseFloat(parts[1]);
		}
	}
	
	return result;
}

export default terrain50_parse;
