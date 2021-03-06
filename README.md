<p align="center">
<img src="./docs/logo.png" width="100%" style="max-width: 900px" />
<a  href="https://github.com/prostojs/logger/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</a>
</p>

Plain simple logger with banner and colors based on `@prostojs/dye`

## Install

npm: `npm install @prostojs/logger`

Via CDN:
```
<script src="https://unpkg.com/@prostojs/dye"></script>
<script src="https://unpkg.com/@prostojs/logger"></script>
```

## Usage

```js
const { dye } = require('@prostojs/dye')
const { ProstoLogger, EProstoLogLevel }  = require('@prostojs/logger')

const logger = new ProstoLogger({
    banner: '[My-Logger]',
    logLevel: EProstoLogLevel.DEBUG,
    timestamp: true,
})

logger.debug('logger.debug')
logger.info('logger.info')
logger.log('logger.log')
logger.warn('logger.warn')
logger.error('logger.error')
```

<img src="./docs/logger.png" style="max-width: 600px" />

### Options

```js
const logger = new ProstoLogger({

    // banner that will be shown next to each message
    // *optional
    banner: '[My-Logger]',

    // maximum log level that will show message
    // *default EProstoLogLevel.LOG
    logLevel: EProstoLogLevel.DEBUG,

    // console interface (usually `console` itself)
    // *default console
    console: console,

    // styles for each message type
    // dye stylist expected
    // *optional
    styles: {
        debug:  dye('yellow-bright', 'dim'),
        info:   dye('green', 'dim'),
        log:    dye(),
        warn:   dye('yellow'),
        error:  dye('red', 'red-bright'),
    },

    // banners for each message type
    // dye stylist expected
    // *optional
    typeBanners: {
        debug:  '[ DEBUG ]',
        info:   '[ INFO  ]',
        log:    '[  LOG  ]',
        warn:   dye('bg-yellow', 'red')('[WARNING]'),
        error:  dye('bg-red', 'white')('[ ERROR ]'),
    },

    // timestamp (boolean | 'ISO' | 'Locale' | 'Time' | 'Date')
    // to add timestamp to each log message
    // *optional
    timestamp: true
})
```
