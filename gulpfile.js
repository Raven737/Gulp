
let project_folder = "dist"; // Папка готового проєкту.
let source_folder = "#src";  // Папка робочого проєкту.

let path = {                 // Шлях до файлів.
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
  },
  clean: "./" + project_folder + "/",
}

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  // webpcss = require('gulp-webpcss'),
  svgSprite = require('gulp-svg-sprite');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}

function html() {															// HTML з папки SRC -> в папку dist -> перезавантаження сторінки.
  return src(path.src.html)										// Обираємо файл html, який знаходиться в папці #src.
    .pipe(fileinclude())											// Збирає в один файл.
    .pipe(webphtml())                         // Інтегрує формат webp в html.
    .pipe(dest(path.build.html))							// Вивантаження файлу html в папку dist.
    .pipe(browsersync.stream())								// Перезавантажили сторінку.
}

function css() {															// SCSS -> CSS -> в dist/css -> перезавантаження сторінки.
  return src(path.src.css)										// Обираємо файл scss, який знаходиться в папці #src.
    .pipe(																		// scss -> css.
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      group_media()                           // Групує і вставляє медіа запити в кінець файлу.
    )
    .pipe(                                    // Додає автопрефікси.
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    // .pipe(webpcss())                          // Інтегрує формат webp в css.
    .pipe(dest(path.build.css))								// Вивантаження файлу css в папку dist/css.
    .pipe(clean_css())                        // Оптимізує (очищає та стискає) css файл.
    .pipe(
      rename({
        extname: ".min.css"                   // Переіменовує файл -> додає до імя + ".min.css"
      })
    )
    .pipe(dest(path.build.css))								// Вивантаження файлу css в папку dist/css.
    .pipe(browsersync.stream())								// Перезавантажили сторінку.
}

function js() {															  // HTML з папки SRC -> в папку dist -> перезавантаження сторінки.
  return src(path.src.js)										  // Обираємо файл html, який знаходиться в папці #src.
    .pipe(fileinclude())											// Збирає в один файл.
    .pipe(dest(path.build.js))							  // Вивантаження файлу html в папку dist.
    .pipe(
      uglify()                                // Оптимізує (зтискає) файл.
    )
    .pipe(
      rename({
        extname: ".min.js"                   // Переіменовує файл -> додає до імя + ".min.js"
      })
    )
    .pipe(dest(path.build.js))							  // Вивантаження файлу html в папку dist.
    .pipe(browsersync.stream())								// Перезавантажили сторінку.
}

function images() {													  // img з папки SRC -> в папку dist -> перезавантаження сторінки.
  return src(path.src.img)										// Обираємо файл img, який знаходиться в папці #src.
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))						  	// Вивантаження файлу img в папку dist.
    .pipe(src(path.src.img))										// Обираємо файл img, який знаходиться в папці #src.
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,     // від 0 до 7.
        svgoPlugins: [
          {
            removeViewBox: false
          }
        ]
      })
    )
    .pipe(dest(path.build.img))						  	// Вивантаження файлу img в папку dist.
    .pipe(browsersync.stream())								// Перезавантажили сторінку.
}

gulp.task('svgSprite', function () {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg",   // sprite file name
          example: true
        }
      },
    }))
    .pipe(dest(path.build.img))						  	// Вивантаження файлу img в папку dist.
})

function watchFiles(params) {
  gulp.watch([path.watch.html], html);				// "Слідкує" за html, якщо є зміни - спрацьовує функція html().
  gulp.watch([path.watch.css], css);					// "Слідкує" за css, якщо є зміни - спрацьовує функція css().
  gulp.watch([path.watch.js], js);					  // "Слідкує" за js, якщо є зміни - спрацьовує функція js().
  gulp.watch([path.watch.img], images);				// "Слідкує" за img, якщо є зміни - спрацьовує функція images().
}

function clean(params) {
  return del(path.clean);											// Видаляє папку dist.
}

let build = gulp.series(clean, gulp.parallel(html, css, js, images));			// Видаляє та виконує одночасно html, css та js.
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;