import { TConsoleBase } from './base.types'
import { TObject } from './types'

export class ProstoLogger<T extends TObject = Record<string, never>> implements TConsoleBase {
    protected messages: TProstoLoggerMessage<T>[] = []

    protected levels: string[]

    protected mappedLevels: Map<string, number> = new Map()

    constructor(protected options?: TProstoLoggerOptions<T>, protected topic = '') {
        if (options?.levels) {
            this.levels = options?.levels
            this.levels.forEach((type, level) => this.mappedLevels.set(type, level))
        } else {
            this.levels = defaultLevels
            this.mappedLevels = defaultMappedLevels
        }
    }

    pushMessage(level: number, args: any[], topic = ''): void {
        if (this.options?.parent) return this.options.parent.pushMessage(level, args, topic)
        const message: TProstoLoggerMessageBase = {
            topic,
            level,
            type: this.levels[level] || '',
            messages: args
                .filter(a => (!(a instanceof Error) && !(a as Error).stack))
                .map(a => textTypes.includes((typeof a)) ? String(a) : a instanceof Error ? `[Error]: ${ a.message }` : safeStringify(a)),
            timestamp: new Date(),
        }
        for (const a of args) {
            if (a instanceof Error && a.stack) {
                message.stack = message.stack || []
                message.stack.push(...(a.stack.split('\n')))
            }
        }        
        const mappedMessage = this.options?.mapper ? this.options.mapper(message) : message as TProstoLoggerMessage<T>
        if (typeof this.options?.persistLevel === 'number' && level <= this.options.persistLevel) {
            this.messages.push(mappedMessage)
        }
        if (this.options?.transports) {
            this.options?.transports.forEach(t => {
                if (typeof t === 'function') {
                    void t(mappedMessage)
                } else {
                    void t.handler(mappedMessage)
                }
            })
        }
    }

    fatal(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('fatal') || 0, args, this.topic)
    }

    error(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('error') || 1, args, this.topic)
    }

    warn(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('warn') || 2, args, this.topic)
    }

    log(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('log') || 3, args, this.topic)
    }

    info(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('info') || 4, args, this.topic)
    }

    debug(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('debug') || 5, args, this.topic)
    }

    trace(...args: any[]) {
        this.pushMessage(this.mappedLevels.get('trace') || 6, args, this.topic)
    }

    /**
     * Creates a child logger with a new topic
     * Child logger pushes the messages through the parent logger
     * @param topic - string
     * @returns new ProstoLogger
     */
    createTopic(topic: string) {
        return new ProstoLogger<T>({
            ...(this.options || {}),
            parent: this,
        }, topic)
    }

    /**
     * Returns the persisted in memory log messages
     * (if options.persistLevel was set)
     */
    getMessages() {
        return this.messages
    }

    /**
     * Clears the persisted in memory log messages
     * (if options.persistLevel was set)
     */
    clear() {
        this.messages = []
    }
}

export interface TProstoLoggerOptions<T extends TObject = Record<string, never>> {
    persistLevel?: number | false
    transports?: (TProstoLoggerTransport<T> | TProstoLoggerTransportFn<T>)[]
    mapper?: TProstoLoggerMapper<T>
    levels?: string[]
    parent?: ProstoLogger<T>
}

export interface TProstoLoggerMessageBase {
    topic?: string
    level: number
    type: string
    messages: string[]
    timestamp: Date
    stack?: string[]
}

export type TProstoLoggerMessage<T extends TObject = Record<string, never>> = TProstoLoggerMessageBase & T

export type TProstoLoggerMapper<T extends TObject = Record<string, never>> = (message: TProstoLoggerMessageBase) => TProstoLoggerMessage<T>

export interface TProstoLoggerTransport<T extends TObject = Record<string, never>> {
    handler: TProstoLoggerTransportFn<T>
}

export type TProstoLoggerTransportFn<T extends TObject = Record<string, never>> = ((m: TProstoLoggerMessage<T>) => void | Promise<void>)

const textTypes = ['string', 'number', 'boolean']

const defaultLevels = [
    'fatal',
    'error',
    'warn',
    'log',
    'info',
    'debug',
    'trace',
]

const defaultMappedLevels = new Map<string, number>()
defaultLevels.forEach((type, level) => defaultMappedLevels.set(type, level))

function safeStringify(obj: unknown) {
    const objType = getObjType(obj as TObject)
    try {
        return objType + ' ' + JSON.stringify(obj)
    } catch (e) {
        return `[${ typeof obj } ${ objType }] (failed to stringify)`
    }
}

function getObjType(obj: TObject): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    return typeof obj === 'object' ? Object.getPrototypeOf(obj)?.constructor?.name as string : ''
}

