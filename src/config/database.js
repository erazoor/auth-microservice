const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const ErrorHandler = require('../utils/error/errorHandler');

const logger = require('../utils/logger');

mongoose.set('strictQuery', false);

const adminClient = new MongoClient(`mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.AUTH_SOURCE}`);

const ensureUserExists = async () => {
    try {
        await adminClient.connect();
        const adminDb = adminClient.db(process.env.AUTH_SOURCE);

        const userExists = await adminDb.command({
            usersInfo: process.env.DATABASE_USERNAME,
        });

        if (!userExists.users || userExists.users.length === 0)
            await adminDb.command({
                createUser: process.env.DATABASE_USERNAME,
                pwd: process.env.DATABASE_PASSWORD,
                roles: [
                    { role: 'userAdminAnyDatabase', db: process.env.AUTH_SOURCE },
                ],
            });

        await adminClient.close();
    } catch (err) {
        throw new ErrorHandler('Failed to ensure user exists in MongoDB', 500);
    }
};

const connect = async () => {
	try {
		await ensureUserExists();
		await mongoose.connect(
			`mongodb://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/?authMechanism=${process.env.AUTH_MECANISM}&authSource=${process.env.AUTH_SOURCE}`
		);
		logger.info('Connected to MongoDB');
	} catch (err) {
		logger.error('Failed to connect to MongoDB', err);
        throw new ErrorHandler('Failed to connect to MongoDB', 500);
	}
};

module.exports = {
	connect,
};
