"use strict";

class Terrain50ValidationMessage {
	constructor(in_level, in_code, in_message) {
		this.level = in_level;
		this.in_code = in_code;
		this.message = in_message;
	}
	
	toString() {
		return `${this.level} ${this.in_code}: ${this.message}`;
	}
}

export default Terrain50ValidationMessage;
