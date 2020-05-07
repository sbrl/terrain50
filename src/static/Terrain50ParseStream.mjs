"use strict";

import nexline from 'nexline';

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
 * let input_stream = fs.createReadStream("path/to/multiple.asc", "utf-8")
 * for await (let next of Terrain50.ParseStream()) {
 * 	console.log(next);
 * }
 * @param	{stream.Readable}		stream	The Stream to read and parse from.
 * @return	{Generator<Terrain50>}	A generator that may emit (at least) 1 or more Terrain50 objects. If no data is found, an empty Terrain50 object is returned.
 */
async function* terrain50_parse_stream(stream) {
	let reader = nexline({ input: stream });
	
	let result = new Terrain50();
	
	while(true) {
		let line = await reader.next();
		if(line == null) break;
		
		line = line.trim();
		if(line.length == 0) continue;
		
		let parts = line.split(/\s+/); 
		
		if(line.search(/^[0-9-.]+\s+/) !== -1) {
			// It's a data line
			result.data.push(parts.map(parseFloat));
		}
		else {
			// It's a metadata line
			
			if(typeof result.meta[parts[0]] != "undefined") {
				// We've seen this before, so it has to be a new one
				yield result;
				result = new Terrain50();
			}
			result.meta[parts[0]] = parts[1]
				.search(/^[0-9-.]+$/) == -1 ? parts[1] : parseFloat(parts[1]);
		}
	}
	// If we reach the end, we won't get the chance yield normally
	yield result;
}

export default terrain50_parse_stream;
