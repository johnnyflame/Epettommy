/* 
 * Typescipt Complilation tasks
 */

var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var typedoc = require("gulp-typedoc");
var tslint = require("gulp-tslint");

var our_code = ['./**/*.ts', '!./node_modules/**'];

gulp.task('build', function () {
	return gulp.src(our_code)
		.pipe(ts({
			noImplicitAny: true,
                        target: "ES3"
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
  del(['doc'], cb);
});

 
gulp.task("tslint", function () {
    return gulp.src(our_code)
        .pipe(tslint({configuration: "test/tslint.json"}))
        .pipe(tslint.report("verbose"));
});

gulp.task("test", function () {
    return console.log("QUnit tests can be run from the browser");
});
 
gulp.task("typedoc", function() {
    return gulp
        .src(our_code)
        .pipe(typedoc({
            // TypeScript options (see typescript docs) 
            module: "commonjs",
            target: "ES3",
            includeDeclarations: true,
 
            // Output options (see typedoc docs) 
            out: "./doc",
            json: "./doc/output.json",
 
            // TypeDoc options (see typedoc docs) 
            name: "ePetTommy",
            ignoreCompilerErrors: false,
            version: true
        }))
    ;
});