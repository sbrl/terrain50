"use strict";

import Terrain50 from '../Terrain50.mjs';

/**
 * Creates a prefilled blank Terrain50 instance.
 * @example
 * import Terrain50 from 'terrain50';
 * // ....
 * let new_instance = Terrain50.Blank(some_metadata_here);
 * @param  {object}		meta	The metadata of the instance to create. See Terrain50.meta for more information.
 * @return {Terrain50}	A new blank instance.
 */
function terrain50_blank(meta) {
	if(typeof meta.nrows !== "number")
		throw new Error("Error: Invalid nrows value in provided metadata.");
	if(typeof meta.ncols !== "number")
		throw new Error("Error: Invalid ncols value in provided metadata.");
	
	let result = new Terrain50(true);
	result.meta = meta;
	
	for(let y = 0; y < result.meta.nrows; y++) {
		let row = [];
		for(let x = 0; x < result.meta.ncols; x++)
			row.push(result.meta.NODATA_value);
		
		result.data.push(row);
	}
	
	return result;
}

export default terrain50_blank;
