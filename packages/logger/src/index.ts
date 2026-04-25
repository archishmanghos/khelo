import winston from 'winston';

export interface LoggerOptions {
  service: string;
  level?: string;
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, service, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${ts} [${service}] ${level}: ${message}${metaStr}${stackStr}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), winston.format.json());

export function createLogger(options: LoggerOptions): winston.Logger {
  const { service, level } = options;
  const isProd = process.env.NODE_ENV === 'production';

  return winston.createLogger({
    level: level || (isProd ? 'info' : 'debug'),
    defaultMeta: { service },
    format: isProd ? prodFormat : devFormat,
    transports: [
      new winston.transports.Console(),
      ...(isProd
        ? [
            new winston.transports.File({
              filename: `logs/${service}-error.log`,
              level: 'error',
              maxsize: 10 * 1024 * 1024, // 10MB
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: `logs/${service}-combined.log`,
              maxsize: 10 * 1024 * 1024,
              maxFiles: 10,
            }),
          ]
        : []),
    ],
  });
}

export type Logger = winston.Logger;
