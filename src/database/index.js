import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

mongoose.Promise = global.Promise;

module.exports = mongoose;
