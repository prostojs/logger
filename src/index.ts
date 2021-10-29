import { dye, TDyeStylist, TDyeStylistConsole, TConsoleInterface } from '@prostojs/dye'

export enum EProstoLogLevel {
    NOTHING,
    ERROR,
    WARN,
    LOG,
    INFO,
    DEBUG,
}

export type TProstoLoggerStyles = {
    [name in keyof TConsoleInterface]: TDyeStylist
}

export type TProstoLoggerTypeBanners = {
    [name in keyof TConsoleInterface]: string
}

export interface TPorstoLoggerOptions {
    banner: string,
    logLevel: EProstoLogLevel,
    console: TConsoleInterface,
    styles: Partial<TProstoLoggerStyles>,
    typeBanners: Partial<TProstoLoggerTypeBanners>
}

const defaultStyles: TProstoLoggerStyles = {
    debug:  dye('yellow-bright', 'dim'),
    info:   dye('green', 'dim'),
    log:    dye(),
    warn:   dye('yellow'),
    error:  dye('red', 'red-bright'),
}

const defaultTypeBanners: TProstoLoggerTypeBanners = {
    debug:  '[ DEBUG ] ',
    info:   '[ INFO  ] ',
    log:    '[  LOG  ] ',
    warn:   dye('bg-yellow', 'red')('[WARNING]') + ' ',
    error:  dye('bg-red', 'white')('[ ERROR ]') + ' ',
}

export class ProstoLogger implements TConsoleInterface {
    protected logLevel: EProstoLogLevel

    public debug: TDyeStylistConsole

    public info: TDyeStylistConsole

    public log: TDyeStylistConsole

    public warn: TDyeStylistConsole

    public error: TDyeStylistConsole

    constructor(options?: Partial<TPorstoLoggerOptions>) {
        this.logLevel = options?.logLevel || EProstoLogLevel.LOG
        const banner = options?.banner || ''
        const styles = {
            ...defaultStyles,
            ...(options?.styles || {}),
        }
        const banners = {
            ...defaultTypeBanners,
            ...(options?.typeBanners || {}),
        }
        const c = options?.console || console

        this.debug = styles.debug.prefix(banner + banners.debug).attachConsole('debug', c),
        this.info = styles.info.prefix(banner + banners.info).attachConsole('info', c),
        this.log = styles.log.prefix(banner + banners.log).attachConsole('log', c),
        this.warn = styles.warn.prefix(banner + banners.warn).attachConsole('warn', c),
        this.error = styles.error.prefix(banner + banners.error).attachConsole('error', c),

        this.debug.enable(this.logLevel >= EProstoLogLevel.DEBUG)
        this.info.enable(this.logLevel >= EProstoLogLevel.INFO)
        this.log.enable(this.logLevel >= EProstoLogLevel.LOG)
        this.warn.enable(this.logLevel >= EProstoLogLevel.WARN)
        this.error.enable(this.logLevel >= EProstoLogLevel.ERROR)
    }
}
