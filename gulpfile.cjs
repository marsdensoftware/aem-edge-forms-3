const { series, src, dest, watch } = require('gulp')
const header = require('gulp-header');
const dartSass = require('sass')
const gulpSass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const postcssMinify = require('@csstools/postcss-minify')
const sourcemaps = require('gulp-sourcemaps') // RW added

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

const styleFolder = 'styles/**/*.scss'
const blocksStyleFolder = 'blocks/**/*.scss'
const styleFolders = [blocksStyleFolder, styleFolder]
const lintHeaders = ['stylelint-disable']
      .map((s)=>`/*${s}*/\n`)
      .join('');

const style = () =>
  src(styleFolders, { base: './' })
    .pipe(sourcemaps.init()) // ✅ Start source map tracking
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugin))
    .pipe(header(lintHeaders))
    .pipe(sourcemaps.write('.')) // ✅ Write .map file next to .css
    .pipe(dest('./'))

const watching = () => {
  watch(styleFolders, series(style))
}

const build = (done) => {
  src(styleFolder, { base: './' })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugin))
    .pipe(header(lintHeaders))
    .pipe(dest('./'))

  done()
}

exports.default = watching
exports.build = series(build)
