<p align="center">
<img src="./docs/logo.png" width="100%" style="max-width: 900px" />
<a  href="https://github.com/prostojs/logger/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</a>
    <img src="https://img.shields.io/badge/Dependencies-0-yellow?style=for-the-badge" />
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
const { dye } = require('@prostojs/dye')
const { ProstoLogger, EProstoLogLevel }  = require('@prostojs/logger')

const logger = new ProstoLogger({
    banner: dye('GREEN')('[Logger]'),
    logLevel: EProstoLogLevel.DEBUG,
})

console.log()
logger.debug('logger.debug')
logger.info('logger.info')
logger.log('logger.log')
logger.warn('logger.warn')
logger.error('logger.error')
console.log()
```

<img src="./docs/logger.png" style="max-width: 600px" />

### Options

```js
const logger = new ProstoLogger({

    // banner that will be shown next to each message
    // *optional
    banner: dye('GREEN')('[Logger]'),

    // maximum log level that will show message
    // *default EProstoLogLevel.LOG
    logLevel: EProstoLogLevel.DEBUG,

    // console interface (usually `console` itself)
    // *default console
    console: console,

    // styles for each message type
    // *optional
    styles: {
        debug:  dye('YELLOW_BRIGHT', 'DIM'),
        info:   dye('GREEN', 'DIM'),
        log:    dye(),
        warn:   dye('YELLOW'),
        error:  dye('RED', 'RED_BRIGHT'),
    },

    // banners for each message type
    // *optional
    typeBanners: {
        debug:  '[ DEBUG ]',
        info:   '[ INFO  ]',
        log:    '[  LOG  ]',
        warn:   dye('BG_YELLOW', 'RED')('[WARNING]'),
        error:  dye('BG_RED', 'WHITE')('[ ERROR ]'),
    },
})
```