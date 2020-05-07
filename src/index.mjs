"use strict";

import Terrain50 from './Terrain50.mjs';
import terrain50_blank from './static/Terrain50Blank.mjs';
import terrain50_parse from './static/Terrain50Parse.mjs';
import terrain50_parse_stream from './static/Terrain50ParseStream.mjs';
import terrain50_merge from './static/Terrain50Merge.mjs';
import terrain50_validate from './static/Terrain50Validate.mjs';

Terrain50.Blank = terrain50_blank;
Terrain50.Parse = terrain50_parse;
Terrain50.ParseStream = terrain50_parse_stream;
Terrain50.Merge = terrain50_merge;
Terrain50.Validate = terrain50_validate;

export { Terrain50 };
export default Terrain50;
