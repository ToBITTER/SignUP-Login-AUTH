const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit the process with failure
    });
}
