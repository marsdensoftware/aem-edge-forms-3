const { series, src, dest, watch } = require('gulp')
const header = require('gulp-header')
const dartSass = require('sass')
const gulpSass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const postcssMinify = require('@csstools/postcss-minify')
const sourcemaps = require('gulp-sourcemaps') // RW added
const gulpif = require('gulp-if')

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

const styleFolders = ['styles/**/*.scss', 'blocks/**/*.scss']
const lintSASSHeaders = ['stylelint-disable']
      .map((s)=>`/*${s}*/\n`)
      .join('')

const makeSASSPipeline = (target, doSrcMap) => () =>
  src(target, { base: './' })
    .pipe(debug({title: 'Processing file:'}))
    .pipe(gulpif(doSrcMap, sourcemaps.init())) // ✅ Start source map tracking
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugin))
    .pipe(header(lintHeaders))
    .pipe(gulpif(doSrcMap, sourcemaps.write('.'))) // ✅ Write .map file next to .css
    .pipe(dest('./'))

const watch_sass = () => {
  watch(styleFolders, series(makeSASSPipeline(styleFolders, true)))
}

const build_sass = makeSASSPipeline(styleFolders, true)

exports.default = watch_sass
exports.build = series(build_sass)
