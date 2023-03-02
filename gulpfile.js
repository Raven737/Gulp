import gulp from "gulp";
const { src, dest, watch, series, parallel } = gulp;
import browsersync from "browser-sync";
import del from "del";
import autoprefixer from "gulp-autoprefixer";
import fileinclude from "gulp-file-include";
import group_media from "gulp-group-css-media-queries";
import rename from "gulp-rename";
import uglify from "gulp-uglify";
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);

const project_folder = "dist";
const source_folder = "#src";

const path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.*",
    },
};

export const deleteDist = () => del(project_folder);

export const html = () =>
    src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());

export const css = () =>
    src(path.src.css)
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
            })
        )
        .pipe(dest(path.build.css))
        .pipe(sass({ outputStyle: "compressed" }))
        .pipe(rename({ extname: ".min.css" }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());

export const js = () =>
    src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({ extname: ".min.js" }))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());

export const img = () =>
    src(path.src.img).pipe(dest(path.build.img)).pipe(browsersync.stream());

export const watchFiles = () => {
    watch([path.watch.html], build, html);
    watch([path.watch.css], build, css);
    watch([path.watch.js], build, js);
    watch([path.watch.img], build, img);
};

export const sync = () =>
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false,
    });

const build = series(deleteDist, parallel(html, css, js, img));

export default series(build, parallel(watchFiles, sync));
