"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = __importStar(require("winston"));
const winstonLogger = winston.createLogger({
    level: 'verbose',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.align(), winston.format.printf(info => `${info.level}: ${info.message}`))
        })
    ]
});
/**
 * Abstraction layer for the Winston logger. The methods are in order from
 * highest level of logging to lowest.
 */
class Logger {
    setLogLevel(logLevel) {
        winstonLogger.level = logLevel;
    }
    debug(message) {
        winstonLogger.log('debug', message);
    }
    verbose(message) {
        winstonLogger.log('verbose', message);
    }
    info(message) {
        winstonLogger.log('info', message);
    }
    log(message) {
        winstonLogger.log('info', message);
    }
    warn(message) {
        winstonLogger.log('warn', message);
    }
    error(message) {
        winstonLogger.log('error', message);
    }
}
const logger = new Logger();
exports.default = logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUduQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFFO0lBQzNDLEtBQUssRUFBRSxTQUFTO0lBQ2hCLFVBQVUsRUFBRTtRQUNYLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUU7WUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUN0QixPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FDL0Q7U0FDRCxDQUFFO0tBQ0g7Q0FDRCxDQUFFLENBQUM7QUFHSjs7O0dBR0c7QUFDSCxNQUFNLE1BQU07SUFFWCxXQUFXLENBQUUsUUFBa0I7UUFDOUIsYUFBYSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7SUFDaEMsQ0FBQztJQUVELEtBQUssQ0FBRSxPQUFlO1FBQ3JCLGFBQWEsQ0FBQyxHQUFHLENBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPLENBQUUsT0FBZTtRQUN2QixhQUFhLENBQUMsR0FBRyxDQUFFLFNBQVMsRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsSUFBSSxDQUFFLE9BQWU7UUFDcEIsYUFBYSxDQUFDLEdBQUcsQ0FBRSxNQUFNLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVELEdBQUcsQ0FBRSxPQUFlO1FBQ25CLGFBQWEsQ0FBQyxHQUFHLENBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxJQUFJLENBQUUsT0FBZTtRQUNwQixhQUFhLENBQUMsR0FBRyxDQUFFLE1BQU0sRUFBRSxPQUFPLENBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsS0FBSyxDQUFFLE9BQWU7UUFDckIsYUFBYSxDQUFDLEdBQUcsQ0FBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLENBQUM7SUFDdkMsQ0FBQztDQUVEO0FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUM1QixrQkFBZSxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3aW5zdG9uIGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IHsgTG9nTGV2ZWwgfSBmcm9tIFwiLi9sb2ctbGV2ZWxcIjtcblxuY29uc3Qgd2luc3RvbkxvZ2dlciA9IHdpbnN0b24uY3JlYXRlTG9nZ2VyKCB7XG5cdGxldmVsOiAndmVyYm9zZScsICAvLyBtYXkgYmUgY2hhbmdlZCBieSBMb2dnZXIuc2V0TG9nTGV2ZWwoKVxuXHR0cmFuc3BvcnRzOiBbXG5cdFx0bmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKCB7XG5cdFx0XHRmb3JtYXQ6IHdpbnN0b24uZm9ybWF0LmNvbWJpbmUoXG5cdFx0XHRcdHdpbnN0b24uZm9ybWF0LmNvbG9yaXplKCksXG5cdFx0XHRcdHdpbnN0b24uZm9ybWF0LmFsaWduKCksXG5cdFx0XHRcdHdpbnN0b24uZm9ybWF0LnByaW50ZihpbmZvID0+IGAke2luZm8ubGV2ZWx9OiAke2luZm8ubWVzc2FnZX1gKVxuXHRcdFx0KVxuXHRcdH0gKVxuXHRdXG59ICk7XG5cblxuLyoqXG4gKiBBYnN0cmFjdGlvbiBsYXllciBmb3IgdGhlIFdpbnN0b24gbG9nZ2VyLiBUaGUgbWV0aG9kcyBhcmUgaW4gb3JkZXIgZnJvbVxuICogaGlnaGVzdCBsZXZlbCBvZiBsb2dnaW5nIHRvIGxvd2VzdC5cbiAqL1xuY2xhc3MgTG9nZ2VyIHtcblxuXHRzZXRMb2dMZXZlbCggbG9nTGV2ZWw6IExvZ0xldmVsICkge1xuXHRcdHdpbnN0b25Mb2dnZXIubGV2ZWwgPSBsb2dMZXZlbDtcblx0fVxuXG5cdGRlYnVnKCBtZXNzYWdlOiBzdHJpbmcgKSB7XG5cdFx0d2luc3RvbkxvZ2dlci5sb2coICdkZWJ1ZycsIG1lc3NhZ2UgKTtcblx0fVxuXG5cdHZlcmJvc2UoIG1lc3NhZ2U6IHN0cmluZyApIHtcblx0XHR3aW5zdG9uTG9nZ2VyLmxvZyggJ3ZlcmJvc2UnLCBtZXNzYWdlICk7XG5cdH1cblxuXHRpbmZvKCBtZXNzYWdlOiBzdHJpbmcgKSB7XG5cdFx0d2luc3RvbkxvZ2dlci5sb2coICdpbmZvJywgbWVzc2FnZSApO1xuXHR9XG5cblx0bG9nKCBtZXNzYWdlOiBzdHJpbmcgKSB7XG5cdFx0d2luc3RvbkxvZ2dlci5sb2coICdpbmZvJywgbWVzc2FnZSApO1xuXHR9XG5cblx0d2FybiggbWVzc2FnZTogc3RyaW5nICkge1xuXHRcdHdpbnN0b25Mb2dnZXIubG9nKCAnd2FybicsIG1lc3NhZ2UgKTtcblx0fVxuXG5cdGVycm9yKCBtZXNzYWdlOiBzdHJpbmcgKSB7XG5cdFx0d2luc3RvbkxvZ2dlci5sb2coICdlcnJvcicsIG1lc3NhZ2UgKTtcblx0fVxuXG59XG5cbmNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbmV4cG9ydCBkZWZhdWx0IGxvZ2dlcjsiXX0=