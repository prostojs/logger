<p align="center">
<img src="./docs/logo.png" width="100%" style="max-width: 900px" />
<a  href="https://github.com/prostojs/logger/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</a>
</p>

Plain simple logger with banner and colors

## Install

npm: `npm install @prostojs/logger`

Via CDN:
```
<script src="https://unpkg.com/@prostojs/dye"></script>
<script src="https://unpkg.com/@prostojs/logger"></script>
```

## Usage

```js
const { ProstoLogger, createConsoleTransort, coloredConsole } = require('@prostojs/logger')

const logger = new ProstoLogger({
    transports: [createConsoleTransort({
        // level: 0,
        format: coloredConsole
    })],
}, 'LOGGER')

logger.error('Error Message', new Error('test error'))
logger.fatal('Fatal here')
logger.warn('Some warning', { object: true, array: [1,2,3] })
logger.log('just a log message')
logger.info('just an info message')
logger.debug('just a debug message')
logger.trace('trace message')
```
