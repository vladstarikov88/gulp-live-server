const gulp = require('gulp');
const pipeIf = require('gulp-if');
const minify = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean-css');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const image = require('gulp-image');
const clear = require('gulp-clean');
const browser = require('browser-sync').create();
const { argv } = require('yargs');

sass.compiler = require('node-sass');

gulp.task('server', (callback) => {
  browser.init({
    server: {
      baseDir: 'build/'
    },
    files: "*.html",
    notify: false,
    online: true
  });

  callback();
});

gulp.task('reload', (callback) => {
  browser.reload();
  callback();
});

gulp.task('clear', () => {
  return gulp.src('build', { allowEmpty: true })
    .pipe(clear({
      force: true
    }));
});

gulp.task('build:html', () => {
  return gulp.src(['src/*.html'])
    .pipe(pipeIf(argv.production, minify({ collapseWhitespace: true })))
    .pipe(gulp.dest('build/'));
});

gulp.task('build:sass', () => {
  return gulp.src(['src/styles/*.sass', 'src/styles/*.scss'])
    .pipe(pipeIf(argv.development, sourcemaps.init()))
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(pipeIf(argv.production, clean()))
    .pipe(pipeIf(argv.development, sourcemaps.write('.')))
    .pipe(gulp.dest('build/styles/'));
});

gulp.task('build:js', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(pipeIf(argv.development, sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(pipeIf(argv.production, uglify()))
    .pipe(pipeIf(argv.development, sourcemaps.write('.')))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('build:images', () => {
  return gulp.src(['src/images/**/*.*'])
    .pipe(pipeIf(argv.production, image()))
    .pipe(gulp.dest('build/images/'));
});


// WATCHERS
gulp.task('watch:html', () => {
  gulp.watch(['src/**/*.html'],
  gulp.series('build:html', 'reload'));
});

gulp.task('watch:sass', () => {
  gulp.watch(['src/styles/**/*.sass', 'src/styles/**/*.scss'],
  gulp.series('build:sass', 'reload'));
});

gulp.task('watch:js', () => {
  gulp.watch('src/js/**/*.js',
  gulp.series('build:js', 'reload'));
});

gulp.task('watch:images', () => {
  gulp.watch(['src/images/**/*.*'],
  gulp.series('build:images'));
});


// COMMANDS
gulp.task('build', gulp.parallel('build:html', 'build:sass', 'build:js', 'build:images'));
gulp.task('watch', gulp.parallel('watch:html', 'watch:sass', 'watch:js', 'watch:images'));
gulp.task('default', gulp.series('clear', 'build', 'server', 'watch'));