class ErrorHandler extends Error {
	constructor(message, status = 500) {
		super(message);
		this.status = status;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}

	static BadRequest(message = 'Bad Request') {
		return new this(message, 400);
	}

	static Unauthorized(message = 'Unauthorized') {
		return new this(message, 401);
	}

	static Forbidden(message = 'Forbidden') {
		return new this(message, 403);
	}

	static NotFound(message = 'Not Found') {
		return new this(message, 404);
	}

	static Conflict(message = 'Conflict') {
		return new this(message, 409);
	}

	static InternalServerError(message = 'Internal Server Error') {
		return new this(message, 500);
	}
}

module.exports = ErrorHandler;
