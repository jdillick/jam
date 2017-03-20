/**
 * -----------------------------------------------------------------------------
 * Dependencies
 * -----------------------------------------------------------------------------
 */
const beautify       = require('js-beautify').js_beautify;
const browserSync    = require('browser-sync');
const csso           = require('gulp-csso');
const del            = require('del');
const gulp           = require('gulp');
const gulpif         = require('gulp-if');
const gutil          = require('gulp-util');
const install        = require('gulp-install');
const nodemon        = require('gulp-nodemon');
const prefix         = require('gulp-autoprefixer');
const runSequence    = require('run-sequence');
const sass           = require('gulp-sass');
const slugify        = require('slugify');
const source         = require('vinyl-source-stream');
const sourcemaps     = require('gulp-sourcemaps');
const webpack        = require('webpack');
const _              = require('underscore');


/**
 * -----------------------------------------------------------------------------
 * Configuration
 * -----------------------------------------------------------------------------
 */
const config = {
	port: {
		browsersync: 9090,
		proxy: 9000
	},
	browsers: 'last 1 version',
	dest: 'dist',
	src: 'src',
	dev: gutil.env.dev,
	scripts: {
		dest	: 'src/public/assets/js',
		src		: 'src/public/src/js/app.js',
		watch	: 'src/public/src/js/**/*'
	},
	styles: {
		dest	: 'src/public/assets/css',
		src		: 'src/public/src/css/style.scss',
		watch	: 'src/public/src/css/**/*.scss'
	},
	build: {
		src: [
			'*.*',
			'src/**',
			'!{node_modules,node_modules/**}',
			'!{src/public/src,src/public/src/**}',
			'!{logs,logs/**}',
			'!webpack.config.js',
			'!gulpfile.js',
			'!{dist,dist/**}'
		],
		watch: [
			'*.*',
			'src/**',
			'!{node_modules,node_modules/**}',
			'!{src/public/src,src/public/src/**}',
			'!{logs,logs/**}',
			'!webpack.config.js',
			'!gulpfile.js',
			'!{dist,dist/**}'
		]
	}
};



/**
 * -----------------------------------------------------------------------------
 * Tasks
 * -----------------------------------------------------------------------------
 */


// clean
gulp.task('clean', (done) => {
	del.sync([config.dest]);
	done();
});


// styles
gulp.task('styles', () => {
	return gulp.src(config.styles.src)
		.pipe(gulpif(config.dev, sourcemaps.init()))
		.pipe(sass({includePaths: './node_modules'}).on('error', sass.logError))
		.pipe(prefix(config.browsers))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(gulpif(config.dev, sourcemaps.write()))
		.pipe(gulp.dest(config.styles.dest))
		.pipe(gulpif(config.dev, browserSync.stream()));
});


// scripts
const webpackConfig = require('./webpack.config')(config);
gulp.task('scripts', (done) => {
	webpack(webpackConfig, (err, stats) => {
		if (err) {
			gutil.log(gutil.colors.red(err()));
		}
		const result = stats.toJson();
		if (result.errors.length) {
			result.errors.forEach((error) => {
				gutil.log(gutil.colors.red(error));
			});
		}
		done();
	});
});


// assemble
gulp.task('assemble', ['styles', 'scripts'], () => {
	return gulp.src(config.build.src)
	.pipe(gulp.dest(config.dest));
});


// nodemon -> start server and reload on change
gulp.task('nodemon', (done) => {
	if (!config.dev) { done(); return; }

	let callbackCalled = false;
	nodemon({
		watch : config.dest,
		script: './'+config.dest+'/index.js',
		ext: 'js ejs json jsx html css scss'
	}).on('start', function () {
		if (!callbackCalled) {
			callbackCalled = true;
			done();
		}
	}).on('restart', function () {
		browserSync.reload();
	});
});


// serve -> browserSync & watch start
gulp.task('serve', (done) => {
	browserSync({
		notify: false,
		timestamps: true,
		reloadDelay: 500,
		reloadDebounce: 2000,
		logPrefix: '00:00:00',
		port: config.port.browsersync,
		ui: {port: config.port.browsersync+1},
		proxy: 'localhost:'+config.port.proxy
	});

	gulp.task('styles:watch', ['styles']);
	gulp.watch([config.styles.watch], ['styles:watch']);

	gulp.task('scripts:watch', ['scripts'], browserSync.reload);
	gulp.watch([config.scripts.watch], ['scripts:watch']);

	gulp.watch(config.build.watch, watcher);

	done();
});


/**
 * -----------------------------------------------------------------------------
 * Watch handler
 * -----------------------------------------------------------------------------
 */
const watcher = (e) => {

	let p = e.path.split(__dirname + '/' + config.src).join('');
	let s = config.src + p;

	if (e.type === 'deleted') {
		let d = __dirname + '/' + config.dest + p;

		del.sync([d]);

	} else {

		p = config.dest + p;

		let a = p.split('/');
		a.pop();

		p = a.join('/');

		gulp.src(s).pipe(gulp.dest(p));
	}
};


 // Create Plugin
gulp.task('create:plugin', () => {
	let id = (gutil.env.name) ? gutil.env.name : 'widget-' + Date.now();
		id = slugify(id);

	let mod = `module.exports = {
		id: '${id}',

		index: 1000000,

		perms: ['all'],

		sections: ['all'],

		zone: 'widgets'
	};`
	mod = beautify(mod);

	let core = (gutil.env.core) ? '_core/' : '';

	let stream = source('./app/'+core+'plugin/' + id + '/mod.js');

    stream.end(mod);
    return stream.pipe(gulp.dest(config.src));

});

// Create Widget
gulp.task('create:widget', ['create:plugin'], () => {
	let id = (gutil.env.name) ? gutil.env.name : 'widget-' + Date.now();
		id = slugify(id);

	let core = (gutil.env.core) ? '_core/' : '';
	let stream = source('./app/'+core+'plugin/' + id + '/widget.ejs');

	let txt = `<!--// Widget ${id} //-->`

	stream.end(txt);
    return stream.pipe(gulp.dest(config.src));
});

// Create Helper Icon placeholder
gulp.task('create:helper-icon', () => {

	let id = (gutil.env.name) ? gutil.env.name : 'helper-' + Date.now();
		id = slugify(id);

	let core = (gutil.env.core) ? '_core/' : '';
	let stream = source('./app/'+core+'helper/' + id + '/icon.ejs');

	let txt = `<path d="M10 10 H 90 V 90 H 10 L 10 10" />`

	stream.end(txt);
    return stream.pipe(gulp.dest(config.src));
});

// Create Helper
gulp.task('create:helper', ['create:helper-icon'], () => {

	let id = (gutil.env.name) ? gutil.env.name : 'helper-' + Date.now();
		id = slugify(id);

	let mod = `module.exports = {
		id: '${id}',

		wysiwyg: "{{${id} param='fubar'}}",

		helper: () => { return 'something'; }
	};`

	mod = beautify(mod);

	let core = (gutil.env.core) ? '_core/' : '';

	let stream = source('./app/'+core+'helper/' + id + '/mod.js');

    stream.end(mod);
    return stream.pipe(gulp.dest(config.src));

	return;

});

// default
gulp.task('default', (done) => {

	if (config.dev) {
		runSequence(['clean'], ['assemble'], ['nodemon'], () => {
			gulp.start('serve');
			done();
		});
	} else {
		runSequence(['clean'], ['assemble'], () => {
			done();
		});
	}
});