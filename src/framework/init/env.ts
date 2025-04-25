import dotenv from 'dotenv';
import path from 'path';
import { env } from 'process';

if (env.NODE_ENV === 'production') {
    console.log('Loaded .env');
    dotenv.config({ path: path.resolve('.env') });
} else {
    env.NODE_ENV = 'develop';
    console.log('Loaded .env.dev');
    dotenv.config({ path: path.resolve('.env.dev') });
}
