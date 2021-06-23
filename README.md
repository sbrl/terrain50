# terrain50

> Library for parsing Ordnance Survey Digital Elevation Model files

I'm handing a number of different Ordnance Survey Digital Elevation Model files (in the [ASCII Esri Grid format](https://en.wikipedia.org/wiki/Esri_grid) as far as I understand) as part of my PhD. This library is the result of the surprisingly extensive code I wrote to handle them.

While it's a relatively simple format to understand, it's completely terrible for disk space usage:

```
ncols 2400
nrows 4000
xllcorner 550000
yllcorner 220000
cellsize 50
NODATA_value -9999
86 77 76 79 (.....)
```

This package makes it bearable. See also [terrain50-cli](https://npmjs.org/package/terrain50-cli), the command-line interface for this library.

 - **Current version:** ![current npm version - see the GitHub releases](https://img.shields.io/npm/v/terrain50)
 - **API Docs:** https://starbeamrainbowlabs.com/code/terrain50/
 - **Changelog:** https://github.com/sbrl/terrain50/blob/master/Changelog.md


## Install
Install via `npm`:

```bash
npm install terrain50 --save
```


## Usage
The full API documentation can be found here: <https://starbeamrainbowlabs.com/code/terrain50/>

Basic usage:

```js
import fs from 'fs';
import Terrain50 from 'terrain50';

(async () => {
    "use strict";
    
    let new_instance = Terrain50.Parse(
        fs.readFileSync("path/to/file.asc", "utf-8")
    );
    
    new_instance.scale(2);
    let output = fs.createWriteStream("path/to/output.asc");
    await my_instance.serialise(output);
})();
```


## Read-world use
 - I'm using it for the main Node.js application for my PhD in Computer Science!
 - _(Are you using this project? Get in touch by [opening an issue](https://github.com/sbrl/terrain50/issues/new))_


## Contributing
Contributions are welcome as PRs! Don't forget to say that you donate your contribution under the _Mozilla Public License 2.0_ in your PR comment.


## Licence
This project is licensed under the _Mozilla Public License 2.0_. See the `LICENSE` file in this repository for the full text.
