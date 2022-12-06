# Changelog
This is the changelog for [`terrain50`](https://npmjs.org/package/terrain50).

Release template text:

-----

Install or update from npm:

```bash
npm install --save terrain50
```

-----


## v1.11 (unreleased)
 - Add `.to_json()` to convert a Terrain50 instance to an object for JSON serialisation.
 - Add static method `Terrain50.FromJson()` to convert a JSON-serialised 


## v1.10.1
 - Fix errors in documentation
 - Update dependencies


## v1.10
 - `.scale()`, `.shift()`: Don't alter NODATA values
 - `.min_value`, `.max_value`: Allow setting to update underlying 2d array


## v1.9.7
 - Add more examples to documentation (this shows immediately in the [api docs](https://starbeamrainbowlabs.com/code/terrain50/))
 - Update dependencies


## v1.9.3
 - I thought we'd fixed the version issue....


## v1.9.2
 - Fix disappearing NODATA values when downscaling 


## v1.9.1
 - Fix reserved word


## v1.9
 - Fix crash in parser
 - Fix crash when scaling down
 - Add new `get_version` function to main exports


## v1.8.4
 - Fix scaling down inputs that contain NODATA values


## v1.8.3
 - Allow the character `e` when validating with `Terrain50.Validate(string)` to allow for very small numbers


## v1.8.2
 - Add new `quiet` argument to `Terrain50.AnalyseFrequencies()`


## v1.8.1
 - Add new `ignore_nodata` argument to the new methods introducted in v1.8

## v1.8
 - Add `terrain50_instance.analyse_frequencies()` for data value frequency analysis
 - Add `Terrain50.AnalayseFrequencies()`


## v1.7
 - `Terrain50.Parse()`: Ensure that the passed argument is actually a string
 - `Terrain50.ParseStream()`:
     - Use a single space in a string as the default delimiter to improve performance (using a regex such as `/\s+/` is still supported via the new `values_delimiter` parameter).
     - Fix code in example

## v1.6
 - Add `do_close` argument to `Terrain50.serialise()` to auto-close stream when done (default: false)


## v1.5.1
 - `Terrain50.ParseStream`: Allow data values like `1.5106e-05`
 - Update dependencies


## v1.5
 - Add convenient import aliases
 - Fix crash in both ParseStream() and Parse() when passed junk
 - Terrain50.validate: Fix crash when encountering an invalid metadata key


## v1.4.1
 - Bugfix: Fix `cellsize` when scaling


## v1.4
 - Add new `Terrain50.ParseStream` function for parsing a stream of multiple concatenated files


## v1.3.1
 - Update README


## v1.3
 - Fix even moar `import`s pointing to the wrong places


## v1.2
 - Fix more `import`s pointing to the wrong places


## v1.1
 - Fix `import` pointing to the wrong place


## v1.0
 - Initial release! Refactored out from my main PhD codebase.
