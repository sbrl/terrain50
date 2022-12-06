"use strict";

import Terrain50 from "../Terrain50.mjs";

/**
 * Converts an object or JSON string back into a Terrain50 instance.
 * @param	{string|object}	obj			The object to convert. It can either be a string (in which case it is passed through JSON.parse()), or an object, in which case it is used to generate a **new** Terrain50 instance.
 * @param	{boolean}		validate	Whether to run the deserialised instance through .validate() to ensure it's integrity.
 * @return	{Terrain50}		The new Terrain50 instance. Note that this is a new instance and **not a copy** of any input object.
 */
function terrain50_from_json(obj, validate=true) {
	if(typeof obj == "string") obj = JSON.parse(obj);
	
	if(typeof obj.newline !== "string")
		throw new Error(`Error: the 'newline' property is of type ${typeof obj.newline}, but expected value of type string.`);
	if(obj.meta === null)
		throw new Error(`Error: the 'meta' property was null, but expected an object.`);
	if(typeof obj.meta !== "object")
		throw new Error(`Error: the 'meta' property is of type ${typeof obj.newline}, but expected value of type object.`);
	if(!(obj.data instanceof Array))
		throw new Error(`Error: the 'data' property is not an array.`);
	
	const result = new Terrain50();
	result.meta = obj.meta;
	result.data = obj.data;
	result.newline = obj.newline;
	
	if(validate) {
		const errors = result.validate();
		if(errors.length > 0) {
			throw new Error(`Terrain50.FromJson Error: Validation failed for deserialised Terrain50 object:\n${errors.map(error => error.toString()).join("\n")}\n***`);
		}
	}
	
	return result;
}

export default terrain50_from_json;