import { DateTime } from 'luxon';
import path from 'path';
import { env } from 'process';
import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, json, errors } = format;
export const LOG_DIR = `${path.resolve()}/log`;

export const logFileFormatFactory = (logFileName: string) => {
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
            datePattern: 'YYYY-MM-DD',
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
        new DailyRotateFile({
            filename: `${LOG_DIR}/framework-%DATE%.log`,
            datePattern: 'YYYY-w',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '53',
            level: 'info',
            format: logFileFormatFactory('framework')(),
        }),
    ],
});

if (JSON.parse(env.DEBUG || 'false')) {
    // if (JSON.parse(env.DEBUG || 'false')) {
    logger.exceptions.handle(new transports.File({ filename: `${LOG_DIR}/exception.log` }));
    logger.rejections.handle(new transports.File({ filename: `${LOG_DIR}/rejections.log` }));
    // }
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
