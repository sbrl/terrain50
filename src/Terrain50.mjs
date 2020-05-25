"use strict";

import nnng from 'nnng';

import l from './helpers/Log.mjs';
import { write_safe } from './helpers/StreamHelpers.mjs';

import Terrain50ValidationMessage from './Terrain50ValidationMessage.mjs';

/**
 * Represents a single Terrain50 tile..
 * Note that this does NOT fill it with data - meta or otherwise. It simply
 * creates the necessary data structures to hold such data.
 * See Terrain50.Parse() (a static method) for parsing an serialised Terrain50 string.
 */
class Terrain50 {
	constructor(was_blank = false) {
		/**
		 * The Terrain50 metadata. Currently known possible values:
		 * 
		 * Example source string	| Meaning
		 * -------------------------|----------------------------------------
		 * `ncols 200`				| The number of columns the data has
		 * `nrows 200`				| The number of rows the data has
		 * `xllcorner 440000`		| The x-coordinate on the OS National Grid of the left-hand-side
		 * `yllcorner 410000`		| The y-coordinate on the OS National Grid of the bottom edge
		 * `cellsize 50`			| The interval (in metres, we assume) between individual pixels in the file.
		 * `NODATA_value -9999`		| If a pixel holds this value, there is no data available for that pixel.
		 * 
		 * Note that some programs (* cough * HAIL-CAESAR * cough *) require these values to be in the *exact* order as above. `terrain50` is capable of parsing them regardless of their order or location in the file, but other programs aren't so forgiving.
		 *
		 * Note also that some programs also don't support the  NODATA_value header meta item, so you may need to delete this (`delete my_instance.meta.NODATA_value`) before saving it for use in these programs.
		 * 
		 * For more information, see https://en.wikipedia.org/wiki/Esri_grid
		 *
		 * @example <caption>Example object for the above table</caption>
		 * {
		 * 	ncols: 200,
		 * 	nrows: 200,
		 * 	xllcorner: 440000,
		 * 	yllcorner: 410000
		 * 	cellsize: 50,
		 * 	NODATA_value: -9999 // May or maynot be present, depending on the input file
		 * }
		 */
		this.meta = {};
		/**
		 * The 2D array of numbers containing the data that this Terrain50
		 * instance contains.
		 * 
		 *  - Each top-level item in the array is a row (starting from the top).
		 *  - Each array contains values from left-right.
		 * @example <caption>Referencing values</caption>
		 * let heightmap = Terrain50.Parse(some_string);
		 * let x = 3, y = 4;
		 * console.log(`Value at (${x}, ${y}): ${heightmap[y][x]}`);
		 * @type {Array}
		 */
		this.data = [];
		
		/**
		 * Whether this tile was a brand-new2 blank one created with Terrain50.Blank() or not.
		 * @type {boolean}
		 */
		this.was_blank = was_blank;
		
		/**
		 * The string to use to denote newlines when serialising.
		 * Note that this is NOT determined from the input file.
		 * @type {String}
		 */
		this.newline = "\n";
	}
	
	/**
	 * Finds and returns the max value in the data 2d array.
	 * Ignores NODATA values.
	 * @return {number} The maximum value.
	 */
	get max_value() {
		return this.data.reduce((prev, row) => Math.max(
			prev,
			...row.filter((x) => x !== this.meta.NODATA_value)
		), -Infinity);
	}
	/**
	 * Finds and returns the min value in the data 2d array.
	 * Ignores NODATA values.
	 * @return {number} The minimum value.
	 */
	get min_value() {
		return this.data.reduce((prev, row) => Math.min(
			prev,
			...row.filter((x) => x !== this.meta.NODATA_value)
		), Infinity);
	}
	
	/**
	 * Shifts the values in this Terrain50 instance such that the minimum value is a given value.
	 * @param  {number} new_min The new minimum value.
	 * @return {number}         The amount the values were shifted by
	 */
	shift(new_min) {
		let shift_amount = new_min - this.min_value;
		for(let row of this.data) {
			for(let i = 0; i < row.length; i++) {
				row[i] += shift_amount;
			}
		}
		return shift_amount;
	}
	
	/**
	 * Scans this Terrain50 instance and replaces all instance of a given value with another.
	 * @param  {number} old_value The value to search for.
	 * @param  {number} new_value THe value to replace it with.
	 */
	replace(old_value, new_value) {
		if(typeof old_value !== "number")
			throw new Error("Error: old_value is not a number");
		if(typeof new_value !== "number")
			throw new Error("Error: new_value is not a number");
		
		for(let row of this.data) {
			for(let i = 0; i < row.length; i++) {
				if(row[i] == old_value) {
					row[i] = new_value;
				}
			}
		}
	}
	
	/**
	 * Round all values in this Terrain50 instance to the nearest integer.
	 * Lowers precision (sometimes quite considerably), but some programs don't
	 * understand floating-point numbers.
	 */
	round() {
		for(let row of this.data) {
			for(let i = 0; i < row.length; i++) {
				row[i] = Math.round(row[i]);
			}
		}
	}
	
	/**
	 * Trims this Terrain50 instance to match the given metadata object.
	 * Note that the reference meta object MUST have an identical cell size to this Terrain50 instance that is to be trimmed.
	 * @param  {Object} meta The metadata from another Terrain50 instance to trim to match.
	 * @return {void}
	 */
	trim(meta) {
		let us = { w: this.meta.ncols, h: this.meta.nrows },
			them = { w: meta.ncols, h: meta.nrows };
		
		let us_geo = { x: this.meta.xllcorner, y: this.meta.yllcorner },
			them_geo = { x: meta.xllcorner, y: meta.yllcorner };
		
		let diff = {
			x: Math.floor((them_geo.x - us_geo.x) / this.meta.cellsize),
			y: Math.floor((them_geo.y - us_geo.y) / this.meta.cellsize)
		};
		
		let trim = {
			top: us.h - (diff.y + them.h),
			right: us.w - (diff.x + them.w),
			left: diff.x,
			bottom: diff.y,
		};
		
		l.debug(`Our meta:`, this.meta);
		l.debug(`Their meta:`, meta);
		l.debug(`Diff:`, diff);
		l.debug(`Trim amounts:`, trim);
		
		// Trim the top and bottom
		this.data.splice(0, trim.top);
		this.data.splice(this.data.length - trim.bottom, trim.bottom);
		// Trim the sides
		for(let row of this.data) {
			row.splice(0, trim.left);
			row.splice(row.length - trim.right, trim.right);
		}
		
		this.meta.nrows = this.meta.nrows - (trim.top + trim.bottom);
		this.meta.ncols = this.meta.ncols - (trim.left + trim.right);
		this.meta.xllcorner = meta.xllcorner;
		this.meta.yllcorner = meta.yllcorner;
		
		l.debug(`Meta after trim:`, this.meta);
		l.debug(`Actual size:`, this.data[0].length, this.data.length);
	}
	
	/**
	 * Scales the *resolution* of this Terrain50 instance by a given scale factor.
	 * The bounding box will not change.
	 * @param  {number} scale_factor The scale factor to apply.
	 */
	scale(scale_factor) {
		// Scale the 2d data array
		if(scale_factor < 1)
			this.__scale_down(scale_factor);
		else if(scale_factor > 1)
			this.__scale_up(scale_factor);
		else
			return; // Nothing to do - scale factor 1 = keep it the same
		
		// Handle the metadata
		this.meta.cellsize *= 1 / scale_factor; // As we reduce the number of cells, the cells themselves get bigger
		this.meta.nrows *= scale_factor;
		this.meta.ncols *= scale_factor;
	}
	
	__scale_down(scale_factor) {
		let numbers_per_group = 1 / scale_factor;
		if(numbers_per_group != Math.floor(numbers_per_group))
			throw new Error("Error: Can't scale down by scale factor that would result in a non-integer number of cells (e.g. a scale factor of 0.25 is ok as 4 hi-res cells = 1 low-res cell, but a value of 0.3 isn't because that would be 3.33333… hi-res cells for every low-res cell)");
		
		let new_data = [];
		/* This could be accelerated wwith GPU.js in theory - as could many of the operations here. It doesn't seem worth it for just a single operation though. */
		for(let y = 0; y < this.data.length; y += numbers_per_group) {
			// Temporary array to hold the values that need averaging
			let values_row = [];
			for(let x = 0; x < this.data[y].length; x += numbers_per_group) {
				// Extract the values to average for this cell
				let values_cell = [];
				for(let y_scan = y; y_scan < y + numbers_per_group; y_scan++)
					values_cell.push(...this.data[y_scan].slice(x, x + numbers_per_group));
				
				values_row.push(values_cell);
			}
			
			// Average all the values in this row & then push them into the new data array
			new_data.push(values_row
				.map((values) =>
					values.reduce((t, x) => t + x, 0) / values.length
				)
			);
		}
		
		this.data = new_data;
	}
	
	/**
	 * Scale up handler - don't call this directly.
	 * You probably want the regular scale() method.
	 * @param  {number} scale_factor The positive integer value to scale by.
	 * @private
	 */
	__scale_up(scale_factor) {
		let new_data = [];
		for(let y = 0; y < this.data.length; y++) {
			let row = [];
			for(let x = 0; x < this.data[y].length; x++) {
				for(let i = 0; i < scale_factor; i++)
					row.push(x);
			}
			
			for(let i = 0; i < scale_factor; i++)
				new_data.push(row);
		}
		this.data = new_data;
	}
	
	/**
	 * Serialises this Terrain50 and writes it to a stream.
	 * Note that the stream is *not* closed automatically - this must be done manually.
	 * @example
	 * import fs from 'fs';
	 * // ....
	 * let output = fs.createWriteStream("path/to/output.asc");
	 * my_instance.serialise(output);
	 * output.end(); // Don't forget to end the stream - this method  doesn't do this automatically
	 * @param	{stream.Writable}	stream	The writable stream to write it to as we serialise it.
	 */
	async serialise(stream) {
		for(let key in this.meta) {
			await write_safe(stream, `${key} ${this.meta[key]}${this.newline}`);
		}
		let seen_lengths = [];
		for(let key in this.data) {
			let row = this.data[key];
			if(!seen_lengths.some((el) => el.value == row.length)) seen_lengths.push({count: 0, value: row.length});
			seen_lengths.find((el) => el.value == row.length).count++;
			
			await write_safe(stream, row.join(" "));
			await write_safe(stream, this.newline);
		}
		l.info(`Seen lengths while serialising: (value → count) ${seen_lengths.map((el) => `${el.value} → ${el.count}`).join(", ")}`);
	}
	
	/**
	 * Validates this Terrain50 instance.
	 * If you want to validate a source string that you are having issues 
	 * parsing, try the Terrain50.Validate() static method instead.
	 * @return {Terrain50ValidationMessage[]} An array of validation issues detected.
	 */
	validate() {
		let errors = [];
		Terrain50.RequiredMetaHeaderKeys.forEach((meta_key) => {
			if(typeof this.meta[meta_key] === "undefined") {
				errors.push(new Terrain50ValidationMessage("error", "TE004",
					`Required metadata header ${meta_key} not found.`
				));
			}
		});
		for(let meta_key in this.meta) {
			if(!Terrain50.ValidMetaHeaderKeys.includes(meta_key)) {
				errors.push(new Terrain50ValidationMessage("warning", "TW001",
					`Unknown meta header key ${meta_key}. Valid header keys: ${Terrain50.ValidMetaHeaderKeys.join(", ")}.`
				));
			}
		}
		
		if(typeof this.meta["nrows"] !== "undefined" && this.meta["nrows"] !== this.data.length) {
			errors.push(new Terrain50ValidationMessage("error", "TE005",
				`Unexpected row count: Expected ${meta["nrows"]} rows from metadata, but found ${this.data.length} in data.`
			));
		}
		
		if(this.data.length === 0) {
			errors.push(new Terrain50ValidationMessage("error", "TE007",
				`No data rows detected.`
			));
		}
		let row_counts = this.data.reduce((result, next_row) => {
			if(!result.includes(next_row.length)) result.push(next_row.length);
			return result;
		}, []);
		if(row_counts.length > 1) {
			errors.push(new Terrain50ValidationMessage("error", "TE008",
				`More than 1 data row element count detected (seen ${row_counts.join(", ")} - but expected only 1 row element count)`
			));
		}
		
		return errors;
	}
	
	/**
	 * Convert this Terrain50 instance into a GeoJSON feature.
	 * Useful for debugging, as it can (almost) be pasted into http://geojson.io/ to quickly visualise it with minimal effort.
	 * @example
	 * // .....
	 * let geojson = {
	 * 	type: "FeatureCollection",
	 * 	features: []
	 * };
	 * for(let next in my_instances) {
	 * 	geojson.features.push(next.to_geojson_feature());
	 * }
	 * console.log(JSON.stringify(geojson));
	 * @return {object}	This Terrain50 instance, as a GeoJSON feature.
	 */
	to_geojson_feature() {
		let offset_x = this.meta.ncols * this.meta.cellsize,
			offset_y = this.meta.nrows * this.meta.cellsize
		return {
			type: "Feature",
			geometry: {
				type: "Polygon",
				coordinates: [
					[
						nnng.from(this.meta.xllcorner, this.meta.yllcorner).reverse(),
						nnng.from(this.meta.xllcorner + offset_x, this.meta.yllcorner).reverse(),
						nnng.from(this.meta.xllcorner + offset_x, this.meta.yllcorner + offset_y).reverse(),
						nnng.from(this.meta.xllcorner, this.meta.yllcorner + offset_y).reverse(),
						// The first & last points in a GeoJSON ploygon need to be identical
						nnng.from(this.meta.xllcorner, this.meta.yllcorner).reverse()
					]
				]
			},
			properties: Object.assign({}, this.meta) // Shallow clone
		}
	}
}

/**
 * An array of metadata valid header items.
 * If a header item is *not* in this list, then it isn't necessarily invalid.
 * It just means that we haven't encountered it before.
 * @type {Array}
 */
Terrain50.ValidMetaHeaderKeys = [
	"ncols", "nrows",
	"xllcorner", "yllcorner",
	"cellsize",
	"NODATA_value"
];

/**
 * AN array of required metadata header keys.
 * SHould be a subset of Terrain50.ValidMetaHeaderKeys.
 * @type {Array}
 */
Terrain50.RequiredMetaHeaderKeys = [
	"ncols", "nrows",
	"xllcorner", "yllcorner",
	"cellsize"
];

export default Terrain50;
