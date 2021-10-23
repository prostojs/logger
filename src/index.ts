import { dye, TDyeStylist } from '@prostojs/dye'
export type TProstoLogArgs = (string | number | Error | Record<string, unknown> | unknown)[]
export interface TConsoleInterface {
    log: (...args: TProstoLogArgs) => void
    info: (...args: TProstoLogArgs) => void
    debug: (...args: TProstoLogArgs) => void
    warn: (...args: TProstoLogArgs) => void
    error: (...args: TProstoLogArgs) => void
}

export enum EProstoLogLevel {
    NOTHING,
    ERROR,
    WARN,
    LOG,
    INFO,
    DEBUG,
}

export type TProstoLoggerStyles = {
    [name in keyof TConsoleInterface]?: TDyeStylist
}

export type TProstoLoggerTypeBanners = {
    [name in keyof TConsoleInterface]?: string
}

export interface TPorstoLoggerOptions {
    banner: string,
    logLevel: EProstoLogLevel,
    console: TConsoleInterface,
    styles: TProstoLoggerStyles,
    typeBanners: TProstoLoggerTypeBanners
}

const defaultStyles: TProstoLoggerStyles = {
    debug:  dye('YELLOW_BRIGHT', 'DIM'),
    info:   dye('GREEN', 'DIM'),
    log:    dye(),
    warn:   dye('YELLOW'),
    error:  dye('RED', 'RED_BRIGHT'),
}

const defaultTypeBanners: TProstoLoggerTypeBanners = {
    debug:  '[ DEBUG ]',
    info:   '[ INFO  ]',
    log:    '[  LOG  ]',
    warn:   dye('BG_YELLOW', 'RED')('[WARNING]'),
    error:  dye('BG_RED', 'WHITE')('[ ERROR ]'),
}


export class ProstoLogger implements TConsoleInterface {
    protected options: TPorstoLoggerOptions

    constructor(options?: Partial<TPorstoLoggerOptions>) {
        this.options = {
            banner: options?.banner || '',
            logLevel: options?.logLevel || EProstoLogLevel.LOG,
            console: options?.console || console,
            styles: {
                ...defaultStyles,
                ...(options?.styles || {})
            },
            typeBanners: options?.typeBanners || defaultTypeBanners,
        }
    }

    protected get banner() {
        return this.options.banner ? this.options.banner + ' ' : ''
    }

    protected get styles() {
        return this.options.styles
    }

    protected get typeBanners() {
        return this.options.typeBanners
    }

    protected get logLevel() {
        return this.options.logLevel
    }

    private post(type: 'info' | 'log' | 'warn' | 'error' | 'debug', ...args: TProstoLogArgs) {
        const banner = this.typeBanners[type]
        const style = this.styles[type] as TDyeStylist
        this.options.console[type](...[style.open + this.banner + style.open + banner + style.open, ...args, style.close])
    }

    public debug(...args: TProstoLogArgs) {
        if ((this.logLevel ) >= EProstoLogLevel.DEBUG) {
            this.post('debug', ...args)
        }
    }

    public info(...args: TProstoLogArgs) {
        if ((this.logLevel ) >= EProstoLogLevel.INFO) {
            this.post('info', ...args)
        }
    }

    public log(...args: TProstoLogArgs) {
        if ((this.logLevel ) >= EProstoLogLevel.LOG) {
            this.post('log', ...args)
        }
    }

    public warn(...args: TProstoLogArgs) {
        if ((this.logLevel ) >= EProstoLogLevel.WARN) {
            this.post('warn', ...args)
        }
    }

    public error(...args: TProstoLogArgs) {
        if ((this.logLevel ) >= EProstoLogLevel.ERROR) {
            this.post('error', ...args)
        }
    }
}
