import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

module.exports = mongoose;
