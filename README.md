# terrain50

> Library for parsing Ordnance Survey Digital Elevation Model files

I'm handing a number of different Ordnance Survey Digital Elevation Model files as part of my PhD. This library is the result of the surprisingly extensive code I wrote to handle them.

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
 - **API Docs:** (coming soon)
 - **Changelog:** https://github.com/sbrl/terrain50/blob/master/Changelog.md


## Install
Install via `npm`:

```bash
npm install terrain50 --save
```


## Usage
The full API documentation can be found here: (TODO: Insert a link here)


## Read-world use
 - I'm using it for the main Node.js application for my PhD in Computer Science!
 - _(Are you using this project? Get in touch by [opening an issue](https://github.com/sbrl/terrain50/issues/new))_


## Contributing
Contributions are welcome as PRs! Don't forget to say that you donate your contribution under the _Mozilla Public License 2.0_ in your PR comment.


## Licence
This project is licensed under the _Mozilla Public License 2.0_. See the `LICENSE` file in this repository for the full text.
