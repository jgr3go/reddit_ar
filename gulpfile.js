'use strict';

let gulp = require('gulp');
let connect = require('gulp-connect');
let rename = require('gulp-rename');
let babel = require('gulp-babel');

gulp.task('default', ['serve']);

let FILES = [
  '**/mooseleague.js'
];

gulp.task('build', () => {
  gulp.src(FILES)
    .pipe(babel())
    .on('error', console.error.bind(console))
    .pipe(rename(path => {
      path.basename += "_babel";
    }))
    .pipe(gulp.dest('./'))
    .pipe(connect.reload());
});

gulp.task('watch', () => {
  gulp.watch(FILES, ['build']);
});

gulp.task('serve', ['watch'], () => {
  connect.server();
});
