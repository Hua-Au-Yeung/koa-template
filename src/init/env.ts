import dotenv from 'dotenv';
import path from 'path';
import { env } from 'process';

if (env.NODE_ENV === 'production') {
    dotenv.config({ path: path.resolve('.env') });
} else {
    env.NODE_ENV = 'develop';
    dotenv.config({ path: path.resolve('.env.dev') });
}
