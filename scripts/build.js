const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')
const { dye } = require('@prostojs/dye')

const args = require('minimist')(process.argv.slice(2))
const formats = args.formats || args.f
const devOnly = args.devOnly || args.d
const isRelease = args.release
const prodOnly = isRelease || (!devOnly && (args.prodOnly || args.p))
const sourceMap = args.sourcemap || args.s
const buildTypes = true
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

let target = ''
run()

async function run() {
  await build()
  checkSize()
}

const error = dye('red', 'bold').attachConsole('error')
const yellow = dye('yellow', 'bold').attachConsole()
const green = dye('green', 'bold').attachConsole()
const gray = dye('green', 'bold')

async function build() {
  const pkgDir = path.resolve(`./`)
  const pkg = require(`${pkgDir}/package.json`)
  target = pkg.name
  // if this is a full build (no specific targets), ignore private packages
  if (isRelease && pkg.private) {
    return
  }

  // if building a specific format, do not remove dist.
  if (!formats) {
    await fs.remove(`${pkgDir}/dist`)
  }

  const env =
    (pkg.buildOptions && pkg.buildOptions.env) ||
    (devOnly ? 'development' : 'production')
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        formats ? `FORMATS:${formats}` : ``,
        buildTypes ? `TYPES:true` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``
      ]
        .filter(Boolean)
        .join(',')
    ],
    { stdio: 'inherit' }
  )

  if (buildTypes && pkg.types) {
    console.log()
    yellow(`Rolling up type definitions for ${ target }...`)
  }
}

function checkSize() {
  const pkgDir = path.resolve(`./`)
  checkFileSize(`${pkgDir}/dist/${target}.global.prod.js`)
  if (!formats || formats.includes('global-runtime')) {
    checkFileSize(`${pkgDir}/dist/${target}.runtime.global.prod.js`)
  }
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const file = fs.readFileSync(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  console.log(
    `${gray(path.basename(filePath)
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
  )
}