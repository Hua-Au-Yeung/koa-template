import { LOG_DIR, logFileFormatFactory, logger } from '@framework/module/logger.js';
import { env } from 'process';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import SentryTransport from 'winston-transport-sentry-node';

logger.add(
    new DailyRotateFile({
        filename: `${LOG_DIR}/biz-%DATE%.log`,
        datePattern: 'YYYY-w',
        zippedArchive: false,
        maxSize: '20m',
        maxFiles: '53',
        level: 'info',
        format: logFileFormatFactory('biz')(),
    }),
);

if (
    JSON.parse(env.SENTRY || 'false')
    && env.NODE_ENV === 'production'
    && JSON.parse(env.DEBUG || 'false') === false
) {
    logger.add(
        new SentryTransport.default({
            sentry: {
                dsn: env.SENTRY_DSN,
            },
            level: env.SENTRY_LOG_LEVEL,
            format: winston.format((info) => {
                // info.tags = { NODE_ID: env.NODE_ID, CLIENT: info.ip }; // filter message in sentry
                return info;
            })(),
        }),
    );
}

export default logger;
