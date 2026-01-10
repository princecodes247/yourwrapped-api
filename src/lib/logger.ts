import * as fs from 'node:fs'
import * as path from 'node:path'
import chalk, { type ChalkInstance } from 'chalk'
import dayjs from 'dayjs'
import env from '../config'

type LogLevelType = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LogLevel: Readonly<Record<'SILENT' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', LogLevelType>> = {
  SILENT: 'silent',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

type LoggerMeta = Record<string, unknown>

abstract class Logger {
  protected minLogLevel: LogLevelType

  constructor(minLogLevel: LogLevelType = "debug") {
    this.minLogLevel = minLogLevel
  }

  protected timestamp(): string {
    return dayjs().format('MM/DD/YY HH:mm:ss')
  }

  protected shouldLog(level: LogLevelType): boolean {
    if (level === 'silent' || this.minLogLevel === 'silent') return false
    const levels = Object.values(LogLevel)
    return levels.indexOf(level) >= levels.indexOf(this.minLogLevel)
  }

  public setMinLogLevel(level: LogLevelType): void {
    if (Object.values(LogLevel).includes(level)) {
      this.minLogLevel = level
    } else {
      throw new Error(`Invalid log level: ${level}`)
    }
  }

  public log(level: LogLevelType, message: string, meta?: LoggerMeta): void {
    if (this.shouldLog(level)) {
      this.writeLog(level, message, meta)
    }
  }

  public debug(message: string, meta?: LoggerMeta): void {
    this.log(LogLevel.DEBUG, message, meta)
  }

  public info(message: string, meta?: LoggerMeta): void {
    this.log(LogLevel.INFO, message, meta)
  }

  public warn(message: string, meta?: LoggerMeta): void {
    this.log(LogLevel.WARN, message, meta)
  }

  public error(message: string, meta?: LoggerMeta): void {
    this.log(LogLevel.ERROR, message, meta)
  }

  protected abstract writeLog(
    level: LogLevelType,
    message: string,
    meta?: LoggerMeta,
  ): void
}

export class ConsoleLogger extends Logger {
  private levelStyles: Record<LogLevelType, ChalkInstance> = {
    debug: chalk.bgMagenta.white,
    info: chalk.bgBlueBright.black,
    warn: chalk.bgYellow.black,
    error: chalk.bgRed.white,
    silent: chalk.gray,
  }

  private makePill(level: LogLevelType): string {
    const color = this.levelStyles[level] || chalk.bgGray.white
    const raw = level.toUpperCase();

    // Compute left/right padding for centering
    const width = 8;
    const totalPadding = width - raw.length;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = Math.ceil(totalPadding / 2);

    const padded = " ".repeat(leftPadding) + raw + " ".repeat(rightPadding);
    return color(padded);
  }

  protected override timestamp(): string {
    return chalk.dim(dayjs().format('MM/DD/YY HH:mm:ss'))
  }

  protected writeLog(
    level: LogLevelType,
    message: string,
    meta?: LoggerMeta,
  ): void {
    const pill = this.makePill(level)
    // const metaText =
    //   meta && Object.keys(meta).length
    //     ? chalk.dim(JSON.stringify(meta))
    //     : ''
    console.log(`${this.timestamp()} ${pill} ${message}`)
    // console.log(`${this.timestamp()} ${pill} ${message}`, meta ?? "")
  }
}

export class FileLogger extends Logger {
  private filePath: string

  constructor(filePath: string, minLogLevel: LogLevelType = LogLevel.DEBUG) {
    super(minLogLevel)
    this.filePath = path.join(path.resolve(), filePath)

    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  protected writeLog(
    level: LogLevelType,
    message: string,
    meta?: LoggerMeta,
  ): void {
    const logEntry = `[${this.timestamp()}] [${level.toUpperCase()}] ${message}${meta ? ` ${JSON.stringify(meta)}` : ''
      }\n`
    fs.appendFileSync(this.filePath, logEntry)
  }
}

export class CompositeLogger extends Logger {
  private loggers: Logger[]

  constructor(...loggers: Logger[]) {
    super()
    this.loggers = loggers
  }

  protected writeLog(
    level: LogLevelType,
    message: string,
    meta?: LoggerMeta,
  ): void {
    this.loggers.forEach((logger) => logger.log(level, message, meta))
  }
}

const logger = new CompositeLogger(
  new ConsoleLogger((process.env?.LOG_LEVEL || LogLevel.DEBUG) as LogLevelType),
  // new FileLogger('/logs/app.log', (process.env?.LOG_LEVEL || LogLevel.DEBUG) as LogLevelType),
)

export default logger
