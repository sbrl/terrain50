"use strict";

import nexline from 'nexline';

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
 * let input_stream = fs.createReadStream("path/to/multiple.asc", "utf-8")
 * for await (let next of Terrain50.ParseStream(input_stream)) {
 * 	console.log(next);
 * }
 * @example Using a regex delimiter
 * // Warning: Using a regex decreases performance.
 * for await (let next  of Terrain50.ParseStream(some_stream, /\s+/)) {
 * 	console.log(next);
 * }
 * @param	{stream.Readable}	stream	The Stream to read and parse from.
 * @param	{RegExp|string}		[values_delimiter=" "]	The delimiter to use when parsing data. Default: a single space character. Set to the regex /\s+/ to improve tolerance, but reduce performance.
 * @return	{Generator<Terrain50>}	A generator that may emit (at least) 1 or more Terrain50 objects. If no data is found, a single empty Terrain50 object is emitted by the generator.
 */
async function* terrain50_parse_stream(stream, values_delimiter = " ") {
	let reader = nexline({ input: stream });
	
	let result = new Terrain50();
	
	while(true) {
		let line = await reader.next();
		if(line == null) break;
		
		line = line.trim();
		if(line.length == 0) continue;
		
		let parts = line.split(values_delimiter); 
		
		if(line.search(/^[0-9-.e]+\s+/) !== -1) {
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
			
			result.meta[parts[0]] = parts[1]
				.search(/^[0-9-.]+$/) == -1 ? parts[1] : parseFloat(parts[1]);
		}
	}
	// If we reach the end, we won't get the chance yield normally
	yield result;
}

export default terrain50_parse_stream;
