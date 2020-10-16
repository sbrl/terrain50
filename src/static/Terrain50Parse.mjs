"use strict";

import Terrain50 from '../Terrain50.mjs';
import l from '../helpers/Log.mjs';

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
	if(typeof str != "string")
		throw new Error(`Error: Terrain50.Parse() can only handle strings (you passed something of type ${typeof str}). For parsing streams see Terrain50.ParseStream().`);
	
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
			if(parts.length < 2) {
				// Something fishy is going on here
				parts[1] = null;
				l.warn(`Warning: Setting a default value of null for metadata key`, parts[0]);
			}
			
			// Handle metadata values with spaces in them
			if(parts.length > 2) {
				// Oops, too many parts - squish them back again
				// Remove the pieces - what a mess
				parts.length = 1;
				// Extract the original full metadata value
				// We trim the end here, since we can guarantee that we don't have anything on the beginning
				let space_match = line.match(/\s+/);
				parts[1] = line.substr(space_match.index + space_match[0].length).trimEnd();
			}
			
			// It's a metadata line
			result.meta[parts[0]] = parts[1].search(/^[0-9-.]+$/) == -1 ? parts[1] : parseFloat(parts[1]);
		}
	}
	
	return result;
}

export default terrain50_parse;
