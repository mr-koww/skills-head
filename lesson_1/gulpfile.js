var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    concat          = require('gulp-concat'),
    uglify          = require('gulp-uglifyjs'),
    browserSync     = require('browser-sync'),
    reload          = browserSync.reload,
    cssnano         = require('gulp-cssnano'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    rename          = require('gulp-rename'),
    del             = require('del'),
    autoprefixer    = require('gulp-autoprefixer'),
    include         = require("gulp-include"),
    slim            = require("gulp-slim");

var path = {
    dist: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        img: 'dist/assets/img/',
        fonts: 'dist/assets/fonts/'
    },
    src: {
        html: 'app/**/*.slim',
        js: 'app/assets/js/app.js',
        style: 'app/assets/sass/**/*.+(scss|sass)',
        img: 'app/assets/images/**/*.*',
        fonts: 'app/assets/fonts/*.*'
    },
    watch: {
        html: 'app/**/*.slim',
        js: 'app/assets/js/app.js',
        style: 'app/assets/css/**/*.+(scss|sass)',
        img: 'app/assets/images/**/*.*',
        fonts: 'app/assets/fonts/*.*'
    },
    clean: 'dist'
};

var server_config = {
    server: {
        baseDir: "dist"
    },
    host: 'localhost',
    port: 9000,
    notify: false
};

gulp.task('webserver', function() {
    browserSync(server_config);
});


gulp.task('clean', function() {
    return del.sync(path.clean);
});


gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(slim({pretty: true}))
        .pipe(gulp.dest(path.dist.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    return gulp.src(path.src.js)
        .pipe(include({
            includePaths: [
                __dirname + "/app/assets/vendors"
            ]
        })
            .on('error', console.log))
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
        .pipe(reload({stream: true}));
});

gulp.task('css:build', function () {
    return gulp.src(path.src.style)

        .pipe(sass().on('error', console.log))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dist.css))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img))
        .pipe(reload({stream: true}));
});


// General tasks
gulp.task('watch', ['browser-sync', 'styles', 'scripts'], function() {
    gulp.watch('app/assets/sass/**/*.+(scss|sass)', ['styles']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/assets/js/app.js', browserSync.reload);
});


gulp.task('build', [
    'clean',
    'html:build',
    'js:build',
    'css:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    gulp.watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    gulp.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    gulp.watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    gulp.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    gulp.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });

});

// Default task
gulp.task('default', ['build', 'webserver', 'watch']);
