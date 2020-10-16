"use strict";

import fs from 'fs';
import path from 'path';

/**
 * Fetches the current version of terrain50.
 * @return	{string}	The current version of the terrain50 library.
 */
async function get_version() {
	let filename_packagejson = path.join(__dirname, "../package.json");
	
	return JSON.parse(
		await fs.promises.readFile(filename_packagejson, "utf-8")
	).version;
}

export default get_version;
