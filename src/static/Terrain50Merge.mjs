"use strict";

import l from '../helpers/Log.mjs';

import Terrain50 from '../Terrain50.mjs';
import terrain50_blank from './Terrain50Blank.mjs';

/**
 * Merges multiple Terrain50 instances.
 * Note that they MUST be a rectangle overall. Gaps in tiles are filled in though.
 * 
 * Note also that all tiles MUST be the same height and width. Expect odd results if they aren't!
 * 
 * In addition, all cells MUST have an identical pixel size (cellsize).
 * 
 * `NODATA_value` MUST NOT be present in any input files. If it is, then it will be ignored and a different value used instead!
 * @example <caption>Basic usage</caption>
 * import Terrain50 from 'terrain50';
 * // ....
 * let new_instance = Terrain50.Merge(
 * 	instance1,
 * 	instance2
 * 	//, instanceN
 * );
 * @example <caption>Using the spread operator</caption>
 * // ....
 * let big = Terrain50.Merge(...array_of_terrain50_instances);
 * @param	{Terrain50}	tiles	The tiles to merge
 * @return	{Terrain50}		1 big Terrain50 instance representing all of the input instances.
 */
function terrain50_merge(...tiles) {
	let stats = {
		x_min: tiles.reduce((prev, next) => Math.min(prev, next.meta.xllcorner), Infinity),
		x_max: tiles.reduce((prev, next) => Math.max(prev, next.meta.xllcorner), -Infinity),
		y_min: tiles.reduce((prev, next) => Math.min(prev, next.meta.yllcorner), Infinity),
		y_max: tiles.reduce((prev, next) => Math.max(prev, next.meta.yllcorner), -Infinity),
		
		incr_x: tiles[0].meta.cellsize * tiles[0].meta.ncols,
		incr_y: tiles[0].meta.cellsize * tiles[0].meta.nrows
	};
	
	l.info(`Checking for missing tiles`);
	let count_created = 0;
	for(let y = stats.y_min; y <= stats.y_max; y += stats.incr_y) {
		for(let x = stats.x_min; x <= stats.x_max; x += stats.incr_x) {
			// If the tile doesn't exist, create it
			// FUTURE: If this is too slow, add new tiles to a separate array first and then concat
			if(!tiles.some((el) => el.meta.xllcorner == x && el.meta.yllcorner == y)) {
				tiles.push(terrain50_blank({
					ncols: tiles[0].meta.ncols,
					nrows: tiles[0].meta.nrows,
					xllcorner: x,
					yllcorner: y,
					cellsize: tiles[0].meta.cellsize,
					NODATA_value: -9999,
				}));
				// l.debug(`Created blank tile for (${x}, ${y})`);
				count_created++;
			}
		}
	}
	l.info(`Done, created ${count_created} blank tiles`);
	
	// Sort the tiles so that they go from bottom-left
	tiles.sort((a, b) => {
		// TODO: Figure out if we're sorting them correctly
		if(a.meta.yllcorner !== b.meta.yllcorner) return b.meta.yllcorner - a.meta.yllcorner;
		return a.meta.xllcorner - b.meta.xllcorner;
	});
	
	// for(let tile of tiles) {
	// 	l.log(`Tile (${tile.meta.xllcorner}, ${tile.meta.yllcorner}) ${tile.was_blank ? "* was blank *" : ""}`);
	// }
	
	let result = new Terrain50();
	let meta_last = null,	// The meta object of the previous tile
		scan_y = 0;			// The current row (y position) in the output array we're beginning appending to (note that this is the TOP of the tile row, and not the bottom as the x/yllcorner variables denote)
	
	let i = 0;
	for(let tile of tiles) {
		if(meta_last == null) meta_last = tile.meta;
		
		// l.log(`Merging tile at (${tile.meta.xllcorner}, ${tile.meta.yllcorner}) starting at ${scan_y} (rowdata | last: ${meta_last.yllcorner}, this: ${tile.meta.yllcorner})`);
		
		if(meta_last.yllcorner !== tile.meta.yllcorner) {
			// This is a new row, move scan_y up
			scan_y += meta_last.nrows;
		}
		// Append this tile to the big ol' merged one
		for(let source_y = 0; source_y < tile.data.length; source_y++) {
			if(typeof result.data[scan_y + source_y] == "undefined") {
				result.data[scan_y + source_y] = [];
			}
			
			result.data[scan_y + source_y].push(...tile.data[source_y]);
		} 
		
		process.stdout.write(`[${i+1} / ${tiles.length}] Processed tile at (${tile.meta.xllcorner}, ${tile.meta.yllcorner})\r`);
		meta_last = tile.meta;
		i++;
	}
	process.stdout.write("\n");
	
	let j = 0;
	for(let key in result.data) {
		j++;
		if(result.data[key] instanceof Array) continue;
		l.log(key, result.data[key]);
	}
	console.log(`Count ${j} / ${result.data.length}`);
	
	result.meta = {
		ncols: result.data[0].length,
		nrows: result.data.length,
		xllcorner: tiles.reduce((prev, next) => Math.min(prev, next.meta.xllcorner), Infinity),
		yllcorner: tiles.reduce((prev, next) => Math.min(prev, next.meta.yllcorner), Infinity),
		cellsize: tiles[0].meta.cellsize,
		NODATA_value: -9999
	}
		
	return result;
}

export default terrain50_merge;
