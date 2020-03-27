"use strict";

import Terrain50 from './Terrain50class.mjs';
import terrain50_blank from './Terrain50Blank.mjs';
import terrain50_parse from './Terrain50Parse.mjs';
import terrain50_merge from './Terrain50Merge.mjs';
import terrain50_validate from './Terrain50Validate.mjs';

Terrain50.Blank = terrain50_blank;
Terrain50.Parse = terrain50_parse;
Terrain50.Merge = terrain50_merge;
Terrain50.Validate = terrain50_validate;

export { Terrain50 };
export default Terrain50;
