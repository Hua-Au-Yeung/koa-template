import { logger } from '@framework/module/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { env } from 'process';

if (env.NODE_ENV === 'production') {
    logger.info('Loaded .env', { file: 'framework' });
    dotenv.config({ path: path.resolve('.env') });
} else {
    env.NODE_ENV = 'develop';
    logger.info('Loaded .env.dev', { file: 'framework' });
    dotenv.config({ path: path.resolve('.env.dev') });
}
