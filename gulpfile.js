const fs = require('fs');
const path = require('path');
const url = require('url');

const del = require('del');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const pug = require('pug');
const gulpPug = require('gulp-pug');
const pretty = require('pretty');
const gulpJsbeautifier = require('gulp-jsbeautifier');

const browserSync = require('browser-sync');
const { reload } = browserSync;

const package = require('./package.json');
const { name, version } = package;


/*-----------------------------------------------
|   Compile JavaScript
-----------------------------------------------*/
const PATHS = {
  JS: {
    SRC: 'js/*.js',
    DEST: {
      DIST: 'dist/js/',
      DOCS: 'docs/assets/js/',
    },
  },
  SCSS: {
    SRC: 'scss/**/*.scss',
    DEST: {
      DIST: 'dist/scss/',
    },
  },
  CSS: {
    DEST: {
      DIST: 'dist/css/',
      DOCS: 'docs/assets/css/',
    },
  },
  PUG: {
    COMPILE: {
      SRC: 'pug/**/!(_)*.pug',
      DEST: 'docs/',
    },
    RAW: {
      SRC: 'pug/**/_*.pug',
      DEST: 'dist/pug/',
    },
  },
  GENERATED: [ 'dist/**/**.*', 'docs/**/**.*' ],
};

/*-----------------------------------------------
|   Cleaning
-----------------------------------------------*/
gulp.task('clean', () => del(Paths.GENERATED, { force: true }));


/*-----------------------------------------------
|   Compile JavaScript
-----------------------------------------------*/
gulp.task('js', () => gulp.src(PATHS.JS.SRC)
  .pipe(eslint({ fix: true }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
  .pipe(concat(`${name}.js`))
  .pipe(replace(/^(export|import).*/gm, ''))
  .pipe(babel({
    compact: false,
    presets: [
      [
        'env',
        {
          modules: false,
          loose: true,
        },
      ],
    ],
    plugins: [
      process.env.PLUGINS && 'transform-es2015-modules-strip',
      '@babel/plugin-proposal-object-rest-spread',
      'transform-strict-mode',
    ].filter(Boolean),
  }))
  .pipe(gulp.dest(PATHS.JS.DEST.DIST))
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest(PATHS.JS.DEST.DIST))
  .pipe(gulp.dest(PATHS.JS.DEST.DOCS)));


/*-----------------------------------------------
|   Compile SCSS
-----------------------------------------------*/
gulp.task('css', () => gulp.src(PATHS.SCSS.SRC)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
  }).on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 5 versions'],
    cascade: false,
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(plumber.stop())
  .pipe(gulp.dest(PATHS.CSS.DEST.DIST))
  .pipe(browserSync.stream()));

gulp.task('css:min', () => gulp.src(PATHS.SCSS.SRC)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
  }).on('error', sass.logError))
  .pipe(autoprefixer({
    browsers: ['last 5 versions'],
    cascade: false,
  }))
  .pipe(cleanCSS({ compatibility: 'ie9' }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(sourcemaps.write('.'))
  .pipe(plumber.stop())
  .pipe(gulp.dest(PATHS.CSS.DEST.DIST))
  .pipe(gulp.dest(PATHS.CSS.DEST.DOCS))
  .pipe(browserSync.stream()));


/*-----------------------------------------------
|   PUG [Compile]
-----------------------------------------------*/
gulp.task('pug2html', () => gulp.src(PATHS.PUG.COMPILE.SRC)
  .pipe(plumber())
  .pipe(gulpPug({
    pretty: true,
    locals: { ENV: 'PRODUCTION', jsPretty : pretty },
  }))
  .pipe(gulpJsbeautifier({
    unformatted: ['code', 'pre', 'em', 'strong', 'span'],
    indent_inner_html: true,
    indent_char: ' ',
    indent_size: 2,
    sep: '\n',
  }))
  .pipe(gulpJsbeautifier.reporter({ verbosity: gulpJsbeautifier.report.ALL }))
  .pipe(plumber.stop())
  .pipe(gulp.dest(PATHS.PUG.COMPILE.DEST)));


/*-----------------------------------------------
|   Compile PUG
-----------------------------------------------*/
/**
 * Browsersync middleware function
 * Compiles .pug files with browsersync
 */

const compilePug = (req, res, next) => {
  const parsed = url.parse(req.url);

  const mkdir = pathName => !fs.existsSync(pathName) && fs.mkdirSync(pathName);
  mkdir(PATHS.PUG.COMPILE.DEST);

  if (parsed.pathname.match(/\.html$/) || parsed.pathname === '/') {

    let file = 'index';

    if (parsed.pathname !== '/') {
      file = parsed.pathname.substring(1, (parsed.pathname.length - 5));
    }

    // Todo: index fallback for subfolders
    let html = pug.renderFile(path.resolve(`./pug/${file}.pug`), { ENV: 'DEV', pretty: false, jsPretty : pretty });
    html = pretty(html, { ocd: false });

    html = html.replace(/\s*(<!-- end of)/g, '$1');

    fs.writeFileSync(`./${PATHS.PUG.COMPILE.DEST}${file}.html`, html);
  }
  next();
};


// /*-----------------------------------------------
// |   Watching
// -----------------------------------------------*/
gulp.task('watch', () => {
  gulp.watch(PATHS.SCSS.SRC, gulp.series('css:min'));

  gulp.watch(PATHS.PUG.COMPILE.SRC, gulp.series((done) => {
    reload();
    done();
  }));

  gulp.watch(PATHS.JS.SRC, gulp.series('js', (done) => {
    reload();
    done();
  }));

  // gulp.watch([Paths.ASSETS.FONTS, Paths.ASSETS.VIDEO, Paths.ASSETS.IMG], (done) => {
  //   reload();
  //   done();
  // });
});


/*-----------------------------------------------
|   Serve
-----------------------------------------------*/
gulp.task('serve', () => {
  browserSync.init({
    server: { baseDir: PATHS.PUG.COMPILE.DEST },
    // proxy: '127.0.0.1:8010',
    port: 3000,
    open: true,
    notify: false,
    middleware: compilePug,
  });
});


/*-----------------------------------------------
|   Default Task
-----------------------------------------------*/
gulp.task('default', gulp.series('js', 'css:min', gulp.parallel('watch', 'serve')));


/*-----------------------------------------------
|   Dist
-----------------------------------------------*/
gulp.task('dist:clean', () => del('dist/', { force: true }));
gulp.task('dist:scss', () => gulp.src(PATHS.SCSS.SRC).pipe(gulp.dest(PATHS.SCSS.DEST.DIST)));
gulp.task('dist:pug', () => gulp.src(PATHS.PUG.RAW.SRC).pipe(gulp.dest(PATHS.PUG.RAW.DEST)));

gulp.task('dist', gulp.series('dist:clean', gulp.parallel('dist:scss', 'dist:pug', 'css', 'css:min', 'js')));