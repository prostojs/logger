const path = require('path')
const ts = require('rollup-plugin-typescript2')
const replace = require('@rollup/plugin-replace')
const { dye } = require('@prostojs/dye')
const { dts } = require('rollup-plugin-dts')

const masterVersion = require('./package.json').version
const packageDir = path.resolve('./')
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}
const name = packageOptions.filename || path.basename(packageDir)

// ensure TS checks only once for each build
let hasTSChecked = false


const dyeModifiers = ['dim', 'bold', 'underscore', 'inverse', 'italic', 'crossed']
const dyeColors = ['red', 'green', 'cyan', 'blue', 'yellow', 'white', 'magenta', 'black']
const warning = dye('yellow').attachConsole()

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.mjs`),
    format: `es`
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`
  },
  // runtime-only builds, for main package only
  'esm-bundler-runtime': {
    file: resolve(`dist/${name}.runtime.esm-bundler.js`),
    format: `es`
  },
  'esm-browser-runtime': {
    file: resolve(`dist/${name}.runtime.esm-browser.js`),
    format: 'es'
  },
  'global-runtime': {
    file: resolve(`dist/${name}.runtime.global.js`),
    format: 'iife'
  }
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
? ['esm-bundler'].map(format => createConfig(format, outputConfigs[format])) // []
  : packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach(format => {
    if (packageOptions.prod === false) {
      return
    }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
  })
}

const configs = [...packageConfigs, {
  plugins: [dts()],
  input: 'src/index.ts',
  output: {
    file: resolve(`dist/${name}.d.ts`),
    format: 'es',
    external: packageConfigs[0].external
  },
}]

module.exports = configs

function createConfig(format, output, plugins = []) {
  if (!output) {
    warning(`invalid format: "${format}"`)
    process.exit(1)
  }

  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file)
  const isBundlerESMBuild = /esm-bundler/.test(format)
  const isBrowserESMBuild = /esm-browser/.test(format)
  const isNodeBuild = format === 'cjs'
  const isGlobalBuild = /global/.test(format)

  output.exports = 'named'
  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false
  output.globals = {
  }

  if (isGlobalBuild) {
    output.name = packageOptions.name
  }

  const shouldEmitDeclarations = false

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations
      },
      exclude: ['**/__tests__', 'test-dts']
    }
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  let entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`

  let external = []

  if (isGlobalBuild || isBrowserESMBuild) {
    if (!packageOptions.enableNonBrowserBranches) {
      // normal browser builds - non-browser only imports are tree-shaken,
      // they are only listed here to suppress warnings.
      external = ['source-map', '@babel/parser', 'estree-walker', ...Object.keys(pkg.dependencies || {})]
    }
  } else {
    // Node / esm-bundler builds.
    // externalize all direct deps
    external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...['path', 'url', 'stream'],
    ]
  }

  const nodePlugins =
    (format === 'cjs' && Object.keys(pkg.devDependencies || {}).length) ||
    packageOptions.enableNonBrowserBranches
      ? [
          // @ts-ignore
          require('@rollup/plugin-commonjs')({
            sourceMap: false,
            ignore: []
          }),
          ...(format === 'cjs'
            ? []
            : // @ts-ignore
              [require('rollup-plugin-polyfill-node')()]),
          require('@rollup/plugin-node-resolve').nodeResolve()
        ]
      : []

  return {
    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [
      tsPlugin,
      createReplacePlugin(
        isProductionBuild,
        isBundlerESMBuild,
        isBrowserESMBuild,
        (isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild) &&
          !packageOptions.enableNonBrowserBranches,
        isGlobalBuild,
        isNodeBuild
      ),
      createDyeReplaceStringPlugin(),
      ...nodePlugins,
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  }
}

function createDyeReplaceStringPlugin() {
  const c = dye('red')
  const bg = dye('bg-red')
  const dyeReplacements = {
    'dye.reset': dye.reset,
    'dye-off.color': c.close,
    'dye-off.bg': bg.close,
  }
  dyeModifiers.forEach(v => {
    dyeReplacements[`dye.${ v }`] = dye(v).open
    dyeReplacements[`dye-off.${ v }`] = dye(v).close
  })
  dyeColors.forEach(v => {
    dyeReplacements[`dye.${ v }`] = dye(v).open
    dyeReplacements[`dye.bg-${ v }`] = dye('bg-' + v).open
    dyeReplacements[`dye.${ v }-bright`] = dye(v + '-bright').open
    dyeReplacements[`dye.bg-${ v }-bright`] = dye('bg-' + v + '-bright').open
  })  
  return replace({
    values: dyeReplacements,
    delimiters: ['<', '>'],
    preventAssignment: false
  })
}

function createDyeReplaceConst() {
  const c = dye('red')
  const bg = dye('bg-red')
  const dyeReplacements = {
    '__DYE_RESET__': '\'' + dye.reset + '\'',
    '__DYE_COLOR_OFF__': '\'' + c.close + '\'',
    '__DYE_BG_OFF__': '\'' + bg.close + '\'',
  }
  dyeModifiers.forEach(v => {
    dyeReplacements[`__DYE_${ v.toUpperCase() }__`] = '\'' + dye(v).open + '\''
    dyeReplacements[`__DYE_${ v.toUpperCase() }_OFF__`] = '\'' + dye(v).close + '\''
  })
  dyeColors.forEach(v => {
    dyeReplacements[`__DYE_${ v.toUpperCase() }__`] = '\'' + dye(v).open + '\''
    dyeReplacements[`__DYE_BG_${ v.toUpperCase() }__`] = '\'' + dye('bg-' + v).open + '\''
    dyeReplacements[`__DYE_${ v.toUpperCase() }_BRIGHT__`] = '\'' + dye(v + '-bright').open + '\''
    dyeReplacements[`__DYE_BG_${ v.toUpperCase() }_BRIGHT__`] = '\'' + dye('bg-' + v + '-bright').open + '\''
  })
  return dyeReplacements
}

function createReplacePlugin(
  isProduction,
  isBundlerESMBuild,
  isBrowserESMBuild,
  isBrowserBuild,
  isGlobalBuild,
  isNodeBuild,
) {

  const replacements = {
    __COMMIT__: `"${process.env.COMMIT}"`,
    __VERSION__: `"${masterVersion}"`,
    __DEV__: isBundlerESMBuild
      ? // preserve to be handled by bundlers
        `(process.env.NODE_ENV !== 'production')`
      : // hard coded dev/prod builds
        !isProduction,
    __TEST__: false,
    __BROWSER__: isBrowserBuild,
    __GLOBAL__: isGlobalBuild,
    __NODE_JS__: isNodeBuild,
    ...createDyeReplaceConst(),
  }
  Object.keys(replacements).forEach(key => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })
  return replace({
    values: replacements,
    preventAssignment: true
  })
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format
  })
}
