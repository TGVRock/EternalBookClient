export class ConsoleLogger {
  private level: ConsoleLogLevel;

  constructor(parameters: ConsoleLogLevel) {
    switch (parameters) {
      case ConsoleLogLevel.fatal:
      case ConsoleLogLevel.error:
      case ConsoleLogLevel.warn:
      case ConsoleLogLevel.info:
      case ConsoleLogLevel.debug:
        this.level = parameters;
        break;

      default:
        this.level = ConsoleLogLevel.error;
        break;
    }
  }

  fatal(...args: any[]): void {
    this.outLog(ConsoleLogLevel.fatal, args);
  }

  error(...args: any[]): void {
    this.outLog(ConsoleLogLevel.error, args);
  }

  warn(...args: any[]): void {
    this.outLog(ConsoleLogLevel.warn, args);
  }

  info(...args: any[]): void {
    this.outLog(ConsoleLogLevel.info, args);
  }

  debug(...args: any[]): void {
    this.outLog(ConsoleLogLevel.debug, args);
  }

  private outLog(targetLevel: ConsoleLogLevel, args: any[]): void {
    if (this.level >= targetLevel) {
      args.forEach((arg) => {
        console.log(arg);
      });
    }
  }
}

export enum ConsoleLogLevel {
  fatal,
  error,
  warn,
  info,
  debug,
}
