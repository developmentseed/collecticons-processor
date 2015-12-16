var fs = require('fs');
var path = require('path');
var program = require('commander');
var _ = require('lodash');
var gulp = require('gulp');
var async = require('async');
var mkpath = require('mkpath');
var archiver = require('archiver');
var del = require('del');
var xeditor = require("gulp-xml-editor");
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var xeditor = require("gulp-xml-editor");
var rename = require("gulp-rename");

////////////////////////////////////////////////////////////////////////////////
///                          COMMAND FUNCTIONS                               ///
////////////////////////////////////////////////////////////////////////////////
function cmdProcess(src, options, finalCb) {
  var fontGlyphs = null;
  var src = path.normalize(src + '/') + '*.svg';
  var templatesPath = __dirname + '/../src/templates/';
  var asyncTasks = [];

  gulp.src(src)
    // Remove svg grid.
    .pipe(stripGrid('svgGrid'))
    .pipe(iconfont({
      fontName: options.fontName,
      spawnWoff2: false,
      normalize: true,
      fontHeight: 1024
    }))
    // After the font is converted, it emit the glyphs.
    // They are stored because at this point the font file is not on disk yet
    // and can't be read and base64 encoded.
    .on('glyphs', function(glyphs, options) {
      fontGlyphs = glyphs;
    })
    .pipe(gulp.dest(options.fontDest))
    // Fonts were created.
    // Encode and write files.
    .on('end', function() {
      // --font-embed
      var encTtf, encWoff;
      if (options.fontEmbed) {
        if (options.fontTypes.indexOf('ttf') != -1) {
          encTtf = new Buffer(fs.readFileSync(path.resolve(options.fontDest, options.fontName + '.ttf'))).toString('base64');
        }
        if (options.fontTypes.indexOf('woff') != -1) {
          encWoff = new Buffer(fs.readFileSync(path.resolve(options.fontDest, options.fontName + '.woff'))).toString('base64');
        }
      }

      var stylFileOpts = {
        className: options.className,
        font: {
          glyphs: fontGlyphs,
          name: options.fontName,
          path: path.relative(options.styleDest, options.fontDest)
        },
        eot: {
          include: options.fontTypes.indexOf('eot') != -1
        },
        ttf: {
          include: options.fontTypes.indexOf('ttf') != -1,
          encode: encTtf
        },
        woff: {
          include: options.fontTypes.indexOf('woff') != -1,
          encode: encWoff
        }
      };

      if (options.styleFormat.indexOf('sass') != -1) {
        asyncTasks.push(function(cb) {
          gulp.src(path.resolve(templatesPath, '_icons.scss'))
            .pipe(consolidate('lodash', stylFileOpts))
            .pipe(rename('_' + options.styleName + '.scss'))
            .pipe(gulp.dest(options.styleDest))
            .on('end', function() { cb(null) });
        });
      }
      if (options.styleFormat.indexOf('css') != -1) {
        asyncTasks.push(function(cb) {
          gulp.src(path.resolve(templatesPath, 'icons.css'))
            .pipe(consolidate('lodash', stylFileOpts))
            .pipe(rename(options.styleName + '.css'))
            .pipe(gulp.dest(options.styleDest))
            .on('end', function() { cb(null) });
        });
      }

      // The options --no-preview is automatically inverted to preview by
      // commander.js How cool is that!
      if (options.preview) {
        // For the preview we use just the encoded woff.
        // If it wasn't encoded previously, do it now.
        if (!encWoff) {
          encWoff = new Buffer(fs.readFileSync(path.resolve(options.fontDest, options.fontName + '.woff'))).toString('base64');
        }

        asyncTasks.push(function(cb) {
          gulp.src(path.resolve(templatesPath, 'preview.html'))
            .pipe(consolidate('lodash', {
              className: options.className,
              font: {
                glyphs: fontGlyphs,
                name: options.fontName,
                path: path.relative(options.styleDest, options.fontDest),
                encodedWoff: encWoff
              }

            }))
            .pipe(gulp.dest(options.previewDest))
            .on('end', function() { cb(null) });
        });
      }

      // Include the catalog?
      // List of all the icons in json format.
      if (options.catalogDest) {
        asyncTasks.push(function(cb) {
          gulp.src(path.resolve(templatesPath, 'catalog.json'))
            .pipe(consolidate('lodash', {
              className: options.className,
              font: {
                glyphs: fontGlyphs,
                name: options.fontName
              }

            }))
            .pipe(gulp.dest(options.catalogDest))
            .on('end', function() { cb(null) });
        });
      }

      // If the fonts were embedded we can delete them.
      // Except the eot since it can't be embedded.
      if (options.fontEmbed) {
        options.fontTypes = _.without(options.fontTypes, 'ttf', 'woff');
      }

      // Delete all except the ones to keep.
      var toDelete = _.difference(['woff2', 'ttf', 'woff', 'eot'], options.fontTypes);
      if (toDelete.length) {
        toDelete = toDelete.map(function(ext) { return path.resolve(options.fontDest, options.fontName + '.' + ext); });
        asyncTasks.push(function(cb) {
          del(toDelete, function() { cb(null); });
        });
      }

      // Run tasks!
      async.series(asyncTasks, function(err, results){
        if (finalCb) finalCb(null);
      });

    });
};

function cmdGrip(src, dest, options) {
  var src = path.normalize(src + '/') + '*.svg';
  if (options.remove) {
    gulp.src(src)
      // Remove svg grid.
      .pipe(stripGrid('svgGrid'))
      .pipe(gulp.dest(dest));
  }
};

function cmdBundle(src, dest, options) {
  var tmpdir = 'collecticons-temp/';

  async.auto({
    clean: function(cb) {
      del(tmpdir, function() { cb(null); });
    },
    gridlessSvg: ['clean', function(cb) {
      gulp.src(path.normalize(src + '/') + '*.svg')
        // Remove svg grid.
        .pipe(stripGrid('svgGrid'))
        .pipe(gulp.dest(tmpdir + 'svg/'))
        .on('end', function() { cb(null) });
    }],
    process: ['clean', function(cb) {
      cmdProcess(src, {
        fontName: 'collecticons',
        fontTypes: ['ttf', 'woff', 'eot'],
        fontDest: tmpdir + 'font/',
        className: 'collecticon',
        styleFormat: ['css'],
        styleDest: tmpdir,
        styleName: 'icons',
        previewDest: tmpdir,
        preview: true,
      }, cb);
    }]
  }, function(err, results) {
    // Create directory before creating write stream.
    mkpath.sync(path.dirname(dest));
    // Zip
    var output = fs.createWriteStream(dest);
    var zipArchive = archiver('zip');
    output.on('close', function() {
      console.log('Bundle created', dest);
      del(tmpdir);
    });

    zipArchive.pipe(output);
    zipArchive.bulk([
      { src: [ '**/*' ], cwd: tmpdir, expand: true}
    ]);

    zipArchive.finalize();

  });

};

////////////////////////////////////////////////////////////////////////////////
///                           HELPER FUNCTIONS                               ///
////////////////////////////////////////////////////////////////////////////////
var stripGrid = function(gridId) {
  return xeditor(function(xml, xmljs) {
    var grid = xml.get('//xmlns:g[@id="' + gridId + '"]', 'http://www.w3.org/2000/svg');
    if (grid) {
      grid.remove();
    }
    return xml;
  });
};

////////////////////////////////////////////////////////////////////////////////
///                                EXPORTS                                   ///
////////////////////////////////////////////////////////////////////////////////

module.exports.process = cmdProcess;
module.exports.grid = cmdGrip;
module.exports.bundle = cmdBundle;