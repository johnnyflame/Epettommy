/* 
 * Typescipt Complilation tasks
 */

var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');

var tslint = require("gulp-tslint");

 
gulp.task('build', function () {
	return gulp.src('**/*.ts')
		.pipe(ts({
			noImplicitAny: true,
                        target: "ES3"
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

 
gulp.task("tslint", function () {
    return gulp.src('**/*.ts')
        .pipe(tslint({configuration: "test/tslint.json"}))
        .pipe(tslint.report("verbose"));
});

gulp.task("test", function () {
    return console.log("QUnit tests can be run from the browser");
});