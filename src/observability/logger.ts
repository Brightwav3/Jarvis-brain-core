import pino from 'pino';
export const createLogger = (component: string, level: string = 'info') => pino({ level, base: { component }, timestamp: pino.stdTimeFunctions.isoTime });
