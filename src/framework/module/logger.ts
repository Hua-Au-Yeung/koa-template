import { DateTime } from 'luxon';
import path from 'path';
import { env } from 'process';
import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import SentryTransport from 'winston-transport-sentry-node';

const { combine, timestamp, json, errors } = format;
const LOG_DIR = `${path.resolve()}/log`;

const logFileFormatFactory = (logFileName: string) => {
    return format((transInfo, opts) => {
        return transInfo.file !== undefined && transInfo.file === logFileName ? transInfo : false;
    });
};

export const logger: winston.Logger = createLogger({
    level: 'info',
    format: combine(
        errors({ stack: true }), // can log Error Object
        timestamp({
            format: () => {
                return DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss');
            },
        }),
        json(),
    ),
    defaultMeta: {},
    transports: [
        new DailyRotateFile({
            filename: `${LOG_DIR}/error-%DATE%.log`,
            datePattern: 'YYYY-w', // 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
        }),
        new DailyRotateFile({
            filename: `${LOG_DIR}/all-combined-%DATE%.log`,
            datePattern: 'YYYY-w',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: env.LOG_LEVEL || 'debug',
        }),
        new DailyRotateFile({
            filename: `${LOG_DIR}/http-%DATE%.log`,
            datePattern: 'YYYY-w',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '53',
            level: 'info',
            format: logFileFormatFactory('http')(),
        }),
    ],
});

if (env.SENTRY === 'true' && env.NODE_ENV === 'production' && env.DEBUG !== 'true') {
    logger.add(
        new SentryTransport.default({
            sentry: {
                dsn: env.SENTRY_DSN,
            },
            level: env.SENTRY_LOG_LEVEL,
            format: winston.format((info) => {
                info.tags = { NODE_ID: env.NODE_ID };
                return info;
            })(),
        }),
    );
}

if (env.NODE_ENV !== 'production') {
    if (env.DEBUG === 'true') {
        logger.exceptions.handle(new transports.File({ filename: `${LOG_DIR}/exception.log` }));
        logger.rejections.handle(new transports.File({ filename: `${LOG_DIR}/rejections.log` }));
    }
    logger.add(
        new transports.Console({
            level: env.LOG_LEVEL || 'debug',
            format: format.combine(
                format.colorize(),
                format.simple(),
            ),
        }),
    );
}

logger.exitOnError = false;
