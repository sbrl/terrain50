# Changlog
This is the master changelog for [`terrain50`](https://npmjs.org/packages/terrain50).

Release template text:

-----

Install or update from npm:

```bash
npm install --save terrain50
```

-----

## Unreleased
 - `Terrain50.Parse()`: Ensure that the passed argument is actually a string


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
