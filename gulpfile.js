
let project_folder = "dist"; // Папка готового проєкту.
let source_folder = "#src";  // Папка початкового (робочого) проєкту.

let path = {                 // Шляхи до файлів.
  build: {                   // Production
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {                     // Source
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {                   // Watching
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
  return src(path.src.html)										// Обирає файл html (#src/.html, а файли _*.html НЕ обирає).
    .pipe(fileinclude())											// Збирає в один файл.
    .pipe(webphtml())                         // Інтегрує формат webp в html.
    .pipe(dest(path.build.html))							// Вивантаження файлу html в папку dist/.
    .pipe(browsersync.stream())								// Перезавантажує сторінку.
}

function css() {															// SCSS -> CSS -> в dist/css -> перезавантаження сторінки.
  return src(path.src.css)										// Обираємо файл style.scss (#src/scss/style.scss).
    .pipe(																		// scss -> css.
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(                                    // Групує і вставляє медіа запити в кінець файлу.
      group_media()
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
      rename({                                // Переіменовує файл: додає до імя + ".min.css"
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))								// Вивантаження файлу css в папку dist/css.
    .pipe(browsersync.stream())								// Перезавантажує сторінку.
}

function js() {															  // JS з папки SRC -> в папку dist -> перезавантаження сторінки.
  return src(path.src.js)										  // Обираємо файл script.js. (#src/js/script.js).
    .pipe(fileinclude())											// Збирає в один файл.
    .pipe(dest(path.build.js))							  // Вивантаження файлу js в папку dist/js.
    .pipe(
      uglify()                                // Оптимізує (зтискає) файл.
    )
    .pipe(
      rename({
        extname: ".min.js"                   // Переіменовує файл: додає до імя + ".min.js".
      })
    )
    .pipe(dest(path.build.js))							  // Вивантаження файлу js в папку dist/js.
    .pipe(browsersync.stream())								// Перезавантажує сторінку.
}

function images() {													  // img з папки SRC -> в папку dist -> перезавантаження сторінки.
  return src(path.src.img)										// Обираємо файл img, який знаходиться в папці #src/img.
    .pipe(                                    // Оптримізує зображення
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))						  	// Вивантаження файлу img в папку dist/img.
    .pipe(src(path.src.img))									// Обираємо файл img, який знаходиться в папці #src/img.
    .pipe(
      imagemin({                              // Стискає зображення.
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
    .pipe(dest(path.build.img))						  	// Вивантаження файлу img в папку dist/img.
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
  gulp.watch([path.watch.html], html);	// "Слідкує" за html (#src/**/*.html), якщо є зміни - спрацьовує функція html().
  gulp.watch([path.watch.css], css);		// "Слідкує" за css (#src/scss/**/*.scss), якщо є зміни - спрацьовує функція css().
  gulp.watch([path.watch.js], js);			// "Слідкує" за js (#src/js/**/*.js), якщо є зміни - спрацьовує функція js().
  gulp.watch([path.watch.img], images);	// "Слідкує" за img (#src/img/**/*.{jpg, png, svg, gif, ico, webp}), якщо є зміни - спрацьовує функція images().
}

function clean(params) {
  return del(path.clean);											// Видаляє папку dist.
}

let build = gulp.series(clean, gulp.parallel(html, css, js, images));	// Видаляє папку dist, а потім одночасно виконує функції html(), css(), js() та images().
let watch = gulp.parallel(build, watchFiles, browserSync);            // 

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;



// series(1, 2, 3) запускає задачі по одній у вказаному порядку (1 -> 2 -> 3).
// parallel(…) виконує задачи одночасно в любому порядку.