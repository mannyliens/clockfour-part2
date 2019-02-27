import gulp from 'gulp';

// Requires the gulp-sass plugin
import sass from 'gulp-sass';

import useref from 'gulp-useref';
const browserSync = require('browser-sync').create();
import uglify from 'gulp-uglify';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import del from 'del';
import gulpSequence from 'gulp-sequence';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';

gulp.task('clean:dist', () => del.sync('dist'))

gulp.task('sass', () => gulp.src('src/styles/**/*.scss')
  .pipe(sass()) // Using gulp-sass
  .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
  }))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist/styles/'))
  .pipe(browserSync.reload({
    stream: true
  })));

gulp.task('sass_prod', () => gulp.src('src/styles/**/*.scss')
  .pipe(sass()) // Using gulp-sass
  .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
  }))
  .pipe(cleanCSS({compatibility: 'ie11'}))
  .pipe(gulp.dest('dist/styles/'))
  .pipe(browserSync.reload({
    stream: true
  })));

gulp.task('html', () => gulp.src('src/**/*.html')
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({
    stream: true
  }))
);
gulp.task('javascript', () => gulp.src('src/**/*.+(js|json)')
  .pipe(gulp.dest('dist/'))
  .pipe(browserSync.reload({
    stream: true
  })));

gulp.task('javascript_prod', () => gulp.src('src/**/*.js')
  .pipe(gulpIf('*.js', uglify()))
  .pipe(gulp.dest('dist'))
);

gulp.task('images_prod', () => gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
.pipe(cache(imagemin({
    interlaced: true
  })))
.pipe(gulp.dest('dist/images')));

gulp.task('images', () => gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
.pipe(gulp.dest('dist/images')));

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    startPath: 'index.html'
  })
})

gulp.task('useref', () => gulp.src('src/*.html')
  .pipe(useref())
  // Minifies only if it's a JavaScript file
  .pipe(gulpIf('*.js', uglify()))
  .pipe(gulp.dest('dist')));

gulp.task('watch', () => {
  gulp.watch('src/**/*.scss', ['sass']);
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.js', ['javascript']);
})

// Build Sequences
// ---------------

gulp.task('default', callback => {
  gulpSequence(['sass', 'html', 'javascript', 'images', 'useref', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', callback => {
  gulpSequence(
    'clean:dist',
    'sass_prod',
    ['useref', 'javascript_prod', 'images_prod', 'html'],
    callback
  )
})
