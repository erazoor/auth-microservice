const express = require('express');
const cors = require('cors');
const session = require('express-session');

const logger = require('./utils/logger');

require('dotenv').config();
require('../src/config/database').connect();

const app = express();
const port = process.env.API_PORT;

const corsOptions = {
	origin: [process.env.FRONTEND_URL],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
	})
);

app.use((req, res, next) => {
	const originalEnd = res.end;
	res.end = function () {
		try {
			const logMessage = `${req.method} ${req.url} ${res.statusCode}`;

			if (res.statusCode >= 500) logger.error(logMessage);
			else if (res.statusCode >= 400) logger.warn(logMessage);
			else logger.info(logMessage);

			originalEnd.apply(this, arguments);
		} catch (err) {
			logger.error('Logging error', err);
		}
	};

	next();
});

app.use((err, req, res, next) => {
    logger.error(`Uncaught error: ${err.message}`);
    res.status(500).send('Something broke !');
})

const routes = [
	{ path: '/auth', router: require('../src/auth_providers/router') },
	{ path: '/account', router: require('../src/account/router'), secure: true },
    { path: '', router: require('../src/router') },
];

routes.forEach((route) => {
	if (route.secure)
		app.use(route.path, authenticate, route.router);

	app.use(route.path, route.router);
});

/**
 * Register the partials for the email templates
 */
registerPartials();

app.listen(port, () => {
	logger.info(
		`Server is listening running on ${process.env.URL_PROTOCOL}://${process.env.API_HOST}:${process.env.API_PORT}`
	);
});
