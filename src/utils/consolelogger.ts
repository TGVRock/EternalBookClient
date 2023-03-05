import { ConsoleLogLevel } from "@/models/ConsoleLogLevel";

/**
 * コンソールロガークラス
 */
export class ConsoleLogger {
  /** ログ出力レベル */
  private level: ConsoleLogLevel;

  /**
   * コンストラクタ
   * @param parameters ログ出力レベル
   */
  constructor(parameters?: ConsoleLogLevel) {
    switch (parameters) {
      case ConsoleLogLevel.fatal:
      case ConsoleLogLevel.error:
      case ConsoleLogLevel.warn:
      case ConsoleLogLevel.info:
      case ConsoleLogLevel.debug:
        this.level = parameters;
        break;

      default:
        this.level = this.getDefaultLevel();
        break;
    }
  }

  /**
   * Fatal ログ出力
   * @param title タイトル(省略可能)
   * @param args 出力データ
   */
  fatal(title?: string, ...args: any[]): void {
    this.outError(ConsoleLogLevel.fatal, title, ...args);
  }

  /**
   * Error ログ出力
   * @param title タイトル(省略可能)
   * @param args 出力データ
   */
  error(title?: string, ...args: any[]): void {
    this.outError(ConsoleLogLevel.error, title, ...args);
  }

  /**
   * Warning ログ出力
   * @param title タイトル(省略可能)
   * @param args 出力データ
   */
  warn(title?: string, ...args: any[]): void {
    this.outWarn(ConsoleLogLevel.warn, title, ...args);
  }

  /**
   * Info ログ出力
   * @param title タイトル(省略可能)
   * @param args 出力データ
   */
  info(title?: string, ...args: any[]): void {
    this.outInfo(ConsoleLogLevel.info, title, ...args);
  }

  /**
   * Debug ログ出力
   * @param title タイトル(省略可能)
   * @param args 出力データ
   */
  debug(title?: string, ...args: any[]): void {
    this.outInfo(ConsoleLogLevel.debug, title, ...args);
  }

  /**
   * コンソールへのエラー出力
   * @param targetLevel ターゲットログレベル
   * @param title タイトル(undefined で省略)
   * @param args 出力データ
   */
  private outError(
    targetLevel: ConsoleLogLevel,
    title?: string,
    ...args: any[]
  ): void {
    if (this.level >= targetLevel) {
      if (typeof title === "undefined" || title.length === 0) {
        console.error(...args);
      } else {
        console.error(title, ...args);
      }
    }
  }

  /**
   * コンソールへの警告出力
   * @param targetLevel ターゲットログレベル
   * @param title タイトル(undefined で省略)
   * @param args 出力データ
   */
  private outWarn(
    targetLevel: ConsoleLogLevel,
    title?: string,
    ...args: any[]
  ): void {
    if (this.level >= targetLevel) {
      if (typeof title === "undefined" || title.length === 0) {
        console.error(...args);
      } else {
        console.error(title, ...args);
      }
    }
  }

  /**
   * コンソールへの情報出力
   * @param targetLevel ターゲットログレベル
   * @param title タイトル(undefined で省略)
   * @param args 出力データ
   */
  private outInfo(
    targetLevel: ConsoleLogLevel,
    title?: string,
    ...args: any[]
  ): void {
    if (this.level >= targetLevel) {
      if (typeof title === "undefined" || title.length === 0) {
        console.info(...args);
      } else {
        console.info(title, ...args);
      }
    }
  }

  /**
   * デフォルトのログレベルを取得
   * @returns デフォルトログレベル
   */
  getDefaultLevel(): ConsoleLogLevel {
    return process.env.NODE_ENV === "development"
      ? ConsoleLogLevel.debug
      : ConsoleLogLevel.error;
  }
}
