"use strict";

import Terrain50 from '../Terrain50.mjs';

/**
 * Return a map of the frequencies of the data values in 1 or more Terrain50 instances.
 * @example Single instance
 * let map = await Terrain50.AnalyseFrequencies(my_terrain50_instance);
 * // The above is equivalent to this:
 * let map = await my_terrain50_instance.analyse_frequencies();
 * @example "Combining with Terrain50.ParseStream"
 * let map = await Terrain50.AnalyseFrequencies(Terrain50.ParseStream(some_stream)));
 * @see		my_terrain50_instance.analyse_frequencies()	The instance method which underpins this static one
 * @see		Terrain50.ParseStream()	Works great with this function
 * @param	{Terrain50|Generator<Promise<Terrain50>>}	input	The input Terrain50 instance to analyse, or an async generator to read from (e.g. the one returned buy Terrain50.ParseStream())
 * @param	{boolean}		ignore_nodata	Whether to ignore NODATA values (default: false)
 * @return	{Promise<Map>}	A key → value map of frequencies in the form Math.floor(data_value) → number of occurrencies
 */
async function terrain50_analyse_frequencies(input, ignore_nodata) {
	if(input instanceof Terrain50)
		return input.analyse_frequencies();
	
	let result = new Map();
	for await (let next of input) {
		// Analyse the frequencies of the next one in the sequence
		let next_map = next.analyse_frequencies(ignore_nodata);
		
		// Sum the returned map with the main map
		for (const [ key, value ] of next_map) {
			if(!result.has(key))
				result.set(key, 0);
			result.set(key, result.get(key) + value);
		}
		next_map.clear();
	}
	return result;
}

export default terrain50_analyse_frequencies;
