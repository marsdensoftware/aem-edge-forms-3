const { series, src, dest, watch, parallel } = require('gulp')
const header = require('gulp-header')
const dartSass = require('sass')
const gulpSass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const postcssMinify = require('@csstools/postcss-minify')
const sourcemaps = require('gulp-sourcemaps') // RW added
const gulpif = require('gulp-if')
const ts = require("gulp-typescript")
const tsProject = ts.createProject("tsconfig.json")

const sass = gulpSass(dartSass)

const plugin = [
  autoprefixer({}),
  pxtorem({
    rootValue: 16,
    unitPrecision: 4,
    propList: ['*', '!border', '!border-*'],
    selectorBlackList: ['letter-spacing', 'border'],
    replace: true,
    mediaQuery: false,
    minPixelValue: 0,
    exclude: /node_modules/i,
  }),
  postcssMinify(),
]

const makePipeline = (target, builder, headers, options) => {
  const headerString = headers?.map((s)=>`/*${s}*/\n`)?.join('')
  return builder(target, headerString, options)
}

const makeSASSPipeline = (target, headers, {doSrcMap}) => () =>{
  return src(target, { base: './' })
    .pipe(gulpif(doSrcMap, sourcemaps.init())) // ✅ Start source map tracking
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugin))
    .pipe(gulpif(headers ? true : false, header(headers)))
    .pipe(gulpif(doSrcMap, sourcemaps.write('.'))) // ✅ Write .map file next to .css
    .pipe(dest('./'))
}

const makeTSPipeline = (target, headers) => () =>
  src(target, { base: './' })
    .pipe(tsProject()).js
    .pipe(gulpif(headers ? true : false, header(headers)))
    .pipe(dest('./'))

const styleFolders = ['styles/**/*.scss', 'blocks/**/*.scss']
const lintSASSHeaders = ['stylelint-disable']
const buildSASS = makePipeline(
  styleFolders, makeSASSPipeline, lintSASSHeaders, {doSrcMap: true}
)
const watchSASS = () => {
  watch(styleFolders, buildSASS)
}

const tsFolders = ['scripts/**/*.ts', 'blocks/**/*.ts']
const lintTSHeaders = ['eslint-disable']

const buildTS = makePipeline(tsFolders, makeTSPipeline, lintTSHeaders)
const watchTS = () => {
  watch(tsFolders, buildTS)
}

exports.default = parallel(watchSASS, watchTS)
exports.build = parallel(buildSASS, buildTS)
exports.buildSASS = buildSASS
exports.watchSASS = watchSASS
exports.buildTS = buildTS
exports.watchTS = watchTS
