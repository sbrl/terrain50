"use strict";

import fs from 'fs';
import path from 'path';

// HACK: Make sure __dirname is defined when using es6 modules. I forget where I found this - a PR with a source URL would be great :D
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

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
