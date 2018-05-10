// grab our gulp packages
var gulp = require('gulp');
var exec = require('child_process').exec;
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var inject = require('gulp-inject');
var hash = require('gulp-hash-filename');
var series = require('stream-series');
var config = require('./config/gulp.json');
var siteConfig = require('./config/config.json');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var environment = 'development'; // development or production

// Watch Task

// gulp.task('sass', function () {
//	gulp.src('./app/site/public/css/scss/**/*.scss')
//		.pipe(sass().on('error', sass.logError))
//		.pipe(gulp.dest('./app/site/public/css'))
// });
// gulp.task('sass-watch', function () {
//	gulp.watch('./app/site/public/css/scss/**/*.scss', ['sass']);
// });

// Admin Task
gulp.task('admin-development', function () {
  var CSSvendorStream = gulp.src(config.admin.vendor.css.src, { read: false });
  var CSSappStream = gulp.src(config.admin.app.css.src, { read: false });
  var JSvendorStream = gulp.src(config.admin.vendor.js.src, { read: false });
  var JSappStream = gulp.src(config.admin.app.js.src, { read: false });

  gulp.src('./views/admin/layout.pug')
    .pipe(inject(series(CSSvendorStream, CSSappStream, JSvendorStream, JSappStream)))
    .pipe(gulp.dest('./views/admin'));
});
gulp.task('admin-production', function () {
  var hashFormat = "{name}.min{ext}";
  if (environment === 'production') {
    hashFormat = "{name}.{hash}.min{ext}";
  }

  var CSSvendorStream = gulp.src(config.admin.vendor.css.src)
    .pipe(concat('vendor.css'))
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(hash({ "format": hashFormat }))
    .pipe(gulp.dest(config.admin.vendor.css.dest));

  var CSSappStream = gulp.src(config.admin.app.css.src)
    .pipe(concat('style.css'))
    .pipe(hash({ "format": hashFormat }))
    .pipe(gulp.dest(config.admin.vendor.css.dest));

  var JSvendorStream = gulp.src(config.admin.vendor.js.src)
    .pipe(concat('vendor.js'))
    .pipe(uglify({ mangle: false }).on('error', function (e) { console.log(e); }))
    .pipe(hash({ "format": hashFormat }))
    .pipe(gulp.dest(config.admin.vendor.js.dest));

  var JSappStream = gulp.src(config.admin.app.js.src)
    .pipe(concat('main.js'))
    .pipe(uglify({ mangle: false }).on('error', function (e) { console.log(e); }))
    .pipe(hash({ "format": hashFormat }))
    .pipe(gulp.dest(config.admin.vendor.js.dest));

  gulp.src('./views/admin/layout.pug')
    .pipe(inject(series(CSSvendorStream, CSSappStream, JSvendorStream, JSappStream)))
    .pipe(gulp.dest('./views/admin'));
});
// Admin Task

// Site Task
gulp.task('site-development', function () {
  for (var i = 0; i < config.site.length; i++) {
    var CSSvendorStream = gulp.src(config.site[i].vendor.css.src, { read: false });

    var JSvendorStream = [];
    for (var group in config.site[i].vendor.js.src) {
      JSvendorStream[group] = gulp.src(config.site[i].vendor.js.src[group], { read: false });
    }

    var JSappStream = gulp.src(config.site[i].app.js.src, { read: false });

    gulp.src('./views/site/layout.pug')
      .pipe(inject(series(CSSvendorStream, JSvendorStream.group1, JSvendorStream.group2, JSvendorStream.group3, JSappStream)))
      .pipe(gulp.dest('./views/site'));
  }
});

gulp.task('site-production', function () {
  var hashFormat = "{name}.min{ext}";
  if (environment === 'production') {
    hashFormat = "{name}.{hash}.min{ext}";
  }

  for (var i = 0; i < config.site.length; i++) {

    var CSSvendorStream = gulp.src(config.site[i].vendor.css.src)
      .pipe(concat('vendor.css'))
      .pipe(hash({ "format": hashFormat }))
      .pipe(gulp.dest(config.site[i].vendor.css.dest));

    var JSvendorStream = [];
    for (var group in config.site[i].vendor.js.src) {
      JSvendorStream[group] = gulp.src(config.site[i].vendor.js.src[group])
        .pipe(concat(group + '.js'))
        .pipe(uglify({ mangle: false }).on('error', function (e) { console.log(e); }))
        .pipe(hash({ "format": hashFormat }))
        .pipe(gulp.dest(config.site[i].vendor.js.dest));
    }

    var JSappStream = gulp.src(config.site[i].app.js.src)
      .pipe(concat('main.js'))
      .pipe(uglify({ mangle: false }).on('error', function (e) { console.log(e); }))
      .pipe(hash({ "format": hashFormat }))
      .pipe(gulp.dest(config.site[i].vendor.js.dest));

    gulp.src('./views/site/layout.pug')
      .pipe(inject(series(CSSvendorStream, JSvendorStream.group1, JSvendorStream.group2, JSvendorStream.group3, JSappStream)))
      .pipe(gulp.dest('./views/site'));
  }
});
// Site Task

gulp.task("mongo", function (cb) {
  var mongodump = 'mongodump --host ' + siteConfig.mongodb.host + ' --port ' + siteConfig.mongodb.port + ' --db ' + siteConfig.mongodb.database + ' --out db';
  var copy = 'xcopy /Y db\\' + siteConfig.mongodb.database + '\\*.* db';
  var remove = 'rmdir /s/q db\\' + siteConfig.mongodb.database;

  exec(mongodump, function (err) {
    if (err) {
      cb(err);
    } else {
      exec(copy, function (err1) {
        if (err1) {
          cb(err1);
        } else {
          exec(remove, function (err2, stdout, stderr) {
            if (err2) {
              cb(err2);
            } else {
              cb(stdout, stderr);
            }
          });
        }
      });
    }
  });
});

gulp.task("setupfile", function () {
  fs.readFile('./config/config.json', "utf8", function (error, data) {
    var _config = JSON.parse(data)
    _config.port = '';
    _config.mongodb.host = '';
    _config.mongodb.port = '';
    _config.mongodb.database = '';
    // fs.writeFile('./config/setup.json', JSON.stringify(_config, null, 4), function (err, respo) { });
  });
});

gulp.task("flush", function () {
  var collections = ['users', 'tasker', 'task', 'notifications', 'messages', 'transaction', 'billing', 'paid', 'newsletter_subscriber', 'contact', 'review_options'];
  MongoClient.connect('mongodb://' + siteConfig.mongodb.host + ':' + siteConfig.mongodb.port + '/' + siteConfig.mongodb.database, function (err, db) {
    for (var i = 0; i < collections.length; i++) {
      db.collection(collections[i]).remove({});
    }
  });
});

gulp.task('production', ['site-production', 'admin-production']);
gulp.task('development', ['site-development', 'admin-development']);
gulp.task('default', ['sass', 'sass-watch']);
gulp.task('setup', ['mongo', 'setupfile', 'production']);
