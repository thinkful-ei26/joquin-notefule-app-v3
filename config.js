'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/noteful',
  TEST_MONGODB_URI:
    process.env.MONGODB_URI ||'mongodb://@ds163745.mlab.com:63745/notefult'
};
