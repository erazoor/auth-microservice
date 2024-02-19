const winston = require('winston');
const os = require('os');
require('winston-daily-rotate-file');

const rotateTransport = new winston.transports.DailyRotateFile({
	filename: 'logs/%DATE%.log',
	datePattern: 'DD-MM-YYYY',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '14d',
	level: 'info',
});

const maskSensitiveData = winston.format((info) => {
	if (info.message.includes('password')) {
		info.message = info.message.replace(/password=.*?(\s|$)/, 'password=****');
	}

	return info;
});

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
		winston.format.json(),
		winston.format.prettyPrint(),
		winston.format((info) => {
			info.metadata = {
				...info.metadata,
				pid: process.pid,
				hostname: os.hostname(),
				platform: os.platform(),
				arch: os.arch(),
				release: os.release(),
			};
			return info;
		})(),
		maskSensitiveData()
	),
	transports: [
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
			handleExceptions: true,
			handleRejections: true,
		}),
		new winston.transports.File({
			filename: 'logs/warn.log',
			level: 'warn',
			format: winston.format((info, opts) => {
				return info.level === 'warn' ? info : false;
			})(),
		}),
		new winston.transports.File({
			filename: 'logs/info.log',
			level: 'info',
			format: winston.format((info, opts) => {
				return info.level === 'info' ? info : false;
			})(),
		}),
		new winston.transports.File({
			filename: 'logs/debug.log',
			level: 'debug',
			format: winston.format((info, opts) => {
				return info.level === 'debug' ? info : false;
			})(),
		}),
		rotateTransport,
	],
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
				winston.format.printf(
					(info) => `${info.timestamp} ${info.level}: ${info.message}`
				)
			),
		})
	);
}

module.exports = logger;
