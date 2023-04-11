import { ProstoLogger } from './logger'

const logger = new ProstoLogger({
    persistLevel: 3,
})

describe('logger', () => {
    it('must log messages', () => {
        logger.fatal('0')
        logger.error('1')
        logger.warn('2')
        logger.log('3')
        logger.info('4')
        logger.debug('5')
        logger.trace('6')
        const msgs = logger.getMessages()
        expect(msgs).toHaveLength(4)
        expect(msgs[0]).toHaveProperty('timestamp')
    })
})
