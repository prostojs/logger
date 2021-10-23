import { ProstoLogger } from "."

const c = {
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}
const banner = '[banner]'

const logger = new ProstoLogger({
    banner,
    console: c,
    logLevel: 9,
})
describe('logger', () => {
    it('must call console.log', () => {
        logger.log('test')
        expect(c.log).toHaveBeenCalledTimes(1)
    })
    it('must call console.warn', () => {
        logger.warn('test', 123)
        expect(c.warn).toHaveBeenCalledTimes(1)
    })
    it('must call console.info', () => {
        logger.info('test', {})
        expect(c.info).toHaveBeenCalledTimes(1)
    })
    it('must call console.error', () => {
        logger.error('test', [1,2,3])
        expect(c.error).toHaveBeenCalledTimes(1)
    })
    it('must call console.debug', () => {
        logger.debug('test')
        expect(c.debug).toHaveBeenCalledTimes(1)
    })
})
