"use strict";

const { dest } = require("gulp");
const gulp = require("gulp");
const minifycss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const header = require("gulp-header");
const buffer = require("vinyl-buffer");
const pkg = require("./package.json");
const debug = require("gulp-debug");
const eslint = require("gulp-eslint");
const prettify = require("gulp-jsbeautifier");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const rename = require("gulp-rename");

var banner = ["/**",
	" * <%= pkg.name %> v<%= pkg.version %>",
	" * Copyright <%= pkg.company %>",
	" * @link <%= pkg.homepage %>",
	" * @license <%= pkg.license %>",
	" */",
	""].join("\n");

gulp.task("prettify-js", function () {
	return gulp.src("./src/js/simplemde.js")
		.pipe(prettify({ js: { brace_style: "collapse", indent_char: "\t", indent_size: 1, max_preserve_newlines: 3, space_before_conditional: false } }))
		.pipe(dest("./src/js"));
})

gulp.task("prettify-css", function () {
	return gulp.src("./src/css/simplemde.css")
		.pipe(prettify({ css: { indentChar: "\t", indentSize: 1 } }))
		.pipe(dest("./src/css"));
});

gulp.task("lint", gulp.series(["prettify-js"]), function () {
	gulp.src("./src/js/**/*.js")
		.pipe(debug())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

function taskBrowserify(opts) {
	return browserify("./src/js/simplemde.js", opts)
		.bundle();
}

gulp.task("browserify:debug", gulp.series(["lint"]), function () {
	return taskBrowserify({ debug: true, standalone: "SimpleMDE" })
		.pipe(source("simplemde.debug.js"))
		.pipe(buffer())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(dest("debug"));
});

gulp.task("browserify", gulp.series(["lint"]), function () {
	return taskBrowserify({ standalone: "SimpleMDE" })
		.pipe(source("simplemde.js"))
		.pipe(buffer())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(dest("./debug/"));
});

// gulp.series(["browserify:debug", "browserify", "lint"]),
gulp.task("scripts", function () {
	var js_files = ["./debug/simplemde.js"];

	return gulp.src(js_files)
		.pipe(concat("simplemde-rtl.min.js"))
		.pipe(uglify())
		.pipe(buffer())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(dest("dist"));
});

// gulp.series(["prettify-css"]),
gulp.task("styles", function () {
	var css_files = [
		"./node_modules/codemirror/lib/codemirror.css",
		"./src/css/*.css",
		"./node_modules/codemirror-spell-checker/src/css/spell-checker.css"
	];
	return gulp.src(css_files)
		.pipe(concat("simplemde.css"))
		.pipe(buffer())
		.pipe(header(banner, { pkg: pkg }))
		// .pipe(dest("./debug/"))
		.pipe(minifycss())
		.pipe(rename("simplemde-rtl.min.css"))
		.pipe(buffer())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('dist'))
});

gulp.task("default", gulp.series(["scripts", "styles"]));
