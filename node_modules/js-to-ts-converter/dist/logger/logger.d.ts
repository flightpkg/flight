import { LogLevel } from "./log-level";
/**
 * Abstraction layer for the Winston logger. The methods are in order from
 * highest level of logging to lowest.
 */
declare class Logger {
    setLogLevel(logLevel: LogLevel): void;
    debug(message: string): void;
    verbose(message: string): void;
    info(message: string): void;
    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
declare const logger: Logger;
export default logger;
