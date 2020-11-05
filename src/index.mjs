"use strict";

import Terrain50 from './Terrain50.mjs';
import terrain50_blank from './static/Terrain50Blank.mjs';
import terrain50_parse from './static/Terrain50Parse.mjs';
import terrain50_parse_stream from './static/Terrain50ParseStream.mjs';
import terrain50_merge from './static/Terrain50Merge.mjs';
import terrain50_validate from './static/Terrain50Validate.mjs';
import terrain50_analyse_frequencies from './static/Terrain50AnalyseFrequencies.mjs';

// HACK: This function prevents the documentation generator from seeing the __dirname hack, which causes it to crash

/**
 * Fetches the current version of terrain50.
 * @return	{string}	The current version of the terrain50 library.
 */
async function get_version() {
	let filename = './get_version'+'.mjs';
	return await import(filename).default();
}

Terrain50.Blank = terrain50_blank;
Terrain50.Parse = terrain50_parse;
Terrain50.ParseStream = terrain50_parse_stream;
Terrain50.Merge = terrain50_merge;
Terrain50.Validate = terrain50_validate;
Terrain50.AnalyseFrequencies = terrain50_analyse_frequencies;

export {
	Terrain50,
	terrain50_blank as Blank,
	terrain50_parse as Parse,
	terrain50_parse_stream as ParseStream,
	terrain50_merge as Merge,
	terrain50_validate as Validate,
	get_version
};
export default Terrain50;
