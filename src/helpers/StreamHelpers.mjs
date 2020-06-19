"use strict";

// function attach_error_handler(stream, id = null) {
// 	if(id == null) id = Math.floor(Math.random() * 0xffffff).toString(16);
// 	stream.on("error", function (error) {
// 		console.error(error);
// 		throw error;
// 	});
// }

/**
 * Writes data to a stream, automatically waiting for the drain event if asked.
 * Do NOT use this - see the prommise-writable npm instead
 * @deprecated
 * @param	{stream.Writable}			stream_out	The writable stream to write to.
 * @param	{string|Buffer|Uint8Array}	data		The data to write.
 * @return	{Promise}	A promise that resolves when writing is complete.
 * @private
 */
function write_safe(stream_out, data) {
	return new Promise(function (resolve, reject) {
		console.log(`Beginning write`);
		// Handle errors
		let handler_error = (error) => {
			stream_out.off("error", handler_error);
			console.log(`Rejecting with error, handler detached`);
			reject(error);
		};
		stream_out.on("error", handler_error);
		
		let returnval = stream_out.write(data);
		console.log(`write returned`, returnval);
		if(returnval) {
			// We're good to go
			stream_out.off("error", handler_error);
			console.log(`All good, handler detached, resolving`);
			resolve();
		}
		else {
			console.log(`Waiting for drain`);
			// We need to wait for the drain event before continuing
			stream_out.once("drain", () => {
				stream_out.off("error", handler_error);
				console.log(`Drain event received, handler detached, resolving`);
				resolve();
			});
		}
	});
}

export { write_safe };
