"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const app_root_path_1 = __importDefault(require("app-root-path"));
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const { combine, colorize, printf, timestamp } = winston_1.default.format;
const logFormat = printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message}`;
});
const rawFormat = printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message}`;
});
// define the custom settings for each transport (file, console)
const options = {
    file: {
        level: "info",
        filename: `${app_root_path_1.default}/logs/%DATE%_app.log`,
        datePattern: "YYYY-MM-DD",
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: "30d",
        colorize: false
    },
    errorFile: {
        level: "error",
        name: "file.error",
        filename: `${app_root_path_1.default}/logs/%DATE%_error.log`,
        datePattern: "YYYY-MM-DD",
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: "30d",
        colorize: true
    },
    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        format: combine(colorize(), rawFormat)
    }
};
// instantiate a new Winston Logger with the settings defined above
exports.logger = winston_1.default.createLogger({
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        new winston_daily_rotate_file_1.default(options.file),
        new winston_daily_rotate_file_1.default(options.errorFile),
        new winston_1.default.transports.Console(options.console)
    ],
    exitOnError: false // do not exit on handled exceptions
});
// create a stream object with a 'write' function that will be used by `morgan`
exports.stream = {
    write: message => {
        exports.logger.info(message);
    }
};
winston_1.default.addColors({
    debug: "white",
    error: "red",
    info: "green",
    warn: "yellow"
});
//# sourceMappingURL=winston.js.map