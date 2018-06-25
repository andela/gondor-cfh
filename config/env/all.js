var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';
require('dotenv').config();

var connectionConfig = {};

if (process.env.NODE_ENV === 'test') {
	connectionConfig = {
		root: rootPath,
		port: process.env.PORT || 3000,
    	db: process.env.MONGOHQ_URL_TEST
	}
} else {
	connectionConfig = {
		root: rootPath,
		port: process.env.PORT || 3000,
    	db: process.env.MONGOHQ_URL
	}
}

module.exports = connectionConfig;