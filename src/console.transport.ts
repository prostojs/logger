import { TProstoLoggerMessage, TProstoLoggerTransportFn } from './logger'
import { TObject } from './types'

export function createConsoleTransort<T extends TObject = Record<string, never>>(opts: {
    level?: number
    format?: (m: TProstoLoggerMessage<T>) => unknown
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
                    console.trace(formatted); break
                default:
                    console.log(formatted)
            }
        }
    }
}

export const coloredConsole: ((m: TProstoLoggerMessage) => string) = (m) => {
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
    return `${color}${topic}${type}[${time}] ${m.messages.join('\n')}${stack}${__DYE_RESET__}`
}

const skipTypes = ['log', 'info', 'warn', 'error']
