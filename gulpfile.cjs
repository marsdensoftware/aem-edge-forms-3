const { series, src, dest, watch } = require('gulp');
const dartSass = require('sass');
const gulpSass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const postcssMinify = require('@csstools/postcss-minify');
const sourcemaps = require('gulp-sourcemaps'); //RW added

const sass = gulpSass(dartSass);

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
];

const styleFolders = ['blocks/**/*.scss', 'styles/**/*.scss'];

const style = () =>
  src(styleFolders, { base: './' })
    .pipe(sourcemaps.init()) // ✅ Start source map tracking
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugin))
    .pipe(sourcemaps.write('.')) // ✅ Write .map file next to .css
    .pipe(dest('./'));

const watching = () => {
  watch(styleFolders, series(style));
};

exports.default = watching;
