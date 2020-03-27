"use strict";

/**
 * Writes data to a stream, automatically waiting for the drain event if asked.
 * @param	{stream.Writable}			stream_out	The writable stream to write to.
 * @param	{string|Buffer|Uint8Array}	data		The data to write.
 * @return	{Promise}	A promise that resolves when writing is complete.
 */
function write_safe(stream_out, data) {
	return new Promise(function (resolve, reject) {
		// Handle errors
		let handler_error = (error) => {
			stream_out.off("error", handler_error);
			reject(error);
		};
		stream_out.on("error", handler_error);
		
		if(stream_out.write(data)) {
			// We're good to go
			stream_out.off("error", handler_error);
			resolve();
		}
		else {
			// We need to wait for the drain event before continuing
			stream_out.once("drain", () => {
				stream_out.off("error", handler_error);
				resolve();
			});
		}
	});
}

export { write_safe };
