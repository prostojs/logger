import { TConsoleBase } from './base.types'
import { ProstoLogger, TProstoLoggerTransport, TProstoLoggerTransportFn } from './logger'

const logger = new ProstoLogger({
    persistLevel: 4,
})

function useLogger(logger: TConsoleBase) {
    logger.info('use generic logger interface')
}

const classBasedTransportFn = jest.fn()
const plainTransportFn: TProstoLoggerTransportFn = jest.fn()

class TestTransport implements TProstoLoggerTransport {
    handler: TProstoLoggerTransportFn<Record<string, never>> = classBasedTransportFn
}

describe('logger', () => {
    it('must log messages', () => {
        logger.clear()
        logger.fatal('0')
        logger.error('1')
        logger.warn('2')
        logger.log('3')
        logger.info('4')
        logger.debug('5')
        logger.trace('6')
        const msgs = logger.getMessages()
        expect(msgs).toHaveLength(5)
        expect(msgs[0]).toHaveProperty('timestamp')
    })
    it('must use generic logger interface', () => {
        logger.clear()
        useLogger(logger)
        const msgs = logger.getMessages()
        expect(msgs).toHaveLength(1)
        expect(msgs[0].messages[0]).toEqual('use generic logger interface')
    })
    it('must create child logger', () => {
        logger.clear()
        const child = logger.createTopic('new topic', 2)
        child.log('new message') // filtered by level 2
        child.error('new error message')
        const msgs = logger.getMessages()
        expect(msgs).toHaveLength(1)
        expect(msgs[0].topic).toEqual('new topic')
    })
    it('must process transport fn', () => {
        const logger = new ProstoLogger({
            transports: [plainTransportFn],
        })
        logger.log('test')
        expect(plainTransportFn).toHaveBeenCalledTimes(1)
    })
    it('must process transport class', () => {
        const logger = new ProstoLogger({
            transports: [new TestTransport()],
        })
        logger.log('test')
        expect(classBasedTransportFn).toHaveBeenCalledTimes(1)
    })
})
