/* eslint-disable @typescript-eslint/no-explicit-any */
import { TProstoLoggerMessage, TProstoLoggerMessageBase, TProstoLoggerTransportFn } from './logger'
import { TObject } from './types'

/**
 * [Log-Transport]
 * Factory for a Console Transport for ProstoLogger
 * @param opts - object with level and format
 * @returns TProstoLoggerTransportFn
 */
export function createConsoleTransort<T extends TObject = any>(opts?: {
    level?: number
    format?: (m: TProstoLoggerMessage<T>) => unknown
    trace?: boolean
}): TProstoLoggerTransportFn<T> {
    return (message) => {
        if (typeof opts?.level === 'undefined' || message.level <= opts?.level) {
            const formatted = opts?.format ? opts.format(message) : message
            switch (message.level) {
                case 0:
                case 1:
                    console.error(formatted); break
                case 2:
                    console.warn(formatted); break
                case 3:
                    console.log(formatted); break
                case 4:
                    console.info(formatted); break
                case 5:
                    console.debug(formatted); break
                case 6:
                    if (opts?.trace) {
                        console.trace(formatted)
                    } else {
                        console.debug(formatted)
                    }
                    break
                default:
                    console.log(formatted)
            }
        }
    }
}

/**
 * [Console-Transport-Formatter]
 * Formatter for Console Transport that provides
 * nice colored console messages
 * @param m 
 * @returns 
 */
export const coloredConsole: ((m: TProstoLoggerMessageBase) => string) = (m) => {
    let color = ''
    switch (m.level) {
        case 0:
        case 1:
            color = __DYE_RED__; break
        case 2:
            color = __DYE_YELLOW__; break
        case 3:
            color = ''; break
        case 4:
            color = __DYE_GREEN__ + __DYE_DIM__; break
        case 5:
            color = __DYE_WHITE__ + __DYE_DIM__; break
        case 6:
            color = __DYE_CYAN__ + __DYE_DIM__; break
    }
    const topic = m.topic ? `[${ m.topic }]` : ''
    const type = (m.type && !skipTypes.includes(m.type)) ? `[${ m.type.padEnd(5).toUpperCase() }]` : ''
    const time = m.timestamp.toISOString().replace('T', ' ').replace(/\.\d{3}z$/i, '')
    const stack = m.stack ? `\n${ __DYE_DIM__ + __DYE_WHITE__ }${ m.stack.join('\n') }` : ''
    const lines = m.messages.map(mes => typeof mes !== 'string' ? safeStringify(m) : m)
    return `${color}${topic}${type}[${time}] ${lines.join('\n') }${stack}${__DYE_RESET__}`
}

/**
 * [Console-Transport-Formatter]
 * Removes any color modifiers from messages
 * @param m
 * @returns log message structure (object)
 */
export const stripColors: ((m: TProstoLoggerMessageBase) => TProstoLoggerMessageBase) = (m) => {
    for (let i = 0; i < m.messages.length; i++) {
        const message = m.messages[i]
        if (typeof message === 'string') {
            m.messages[i] = message.replace(/\x1b\[[^m]+m/g, '')
        }
    }
    return m
}

const skipTypes = ['log', 'info', 'warn', 'error']

function safeStringify(obj: unknown) {
    const objType = getObjType(obj as TObject)
    try {
        return objType + ' ' + JSON.stringify(obj)
    } catch (e) {
        return `[${typeof obj} ${objType}] (failed to stringify)`
    }
}

function getObjType(obj: TObject): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    return typeof obj === 'object' ? Object.getPrototypeOf(obj)?.constructor?.name as string : ''
}
