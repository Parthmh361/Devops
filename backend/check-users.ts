import mongoose from 'mongoose';
import User from './src/models/User.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const checkUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MONGO_URI not found');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const users = await User.find({}, 'name email role isActive');
        console.log('Users in DB:');
        console.log(JSON.stringify(users, null, 2));

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error checking users:', error);
    }
};

checkUsers();
