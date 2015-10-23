var fs = require('fs');
var cp = require('child_process');
var util = require('util');
var assert = require('assert');
var del = require('del');
var collecticons = __dirname + '/../bin/collecticons.js';

// This file tests the compile command of collecticons.
// Right now it only tests whether the files are output or not.
// There no checks regarding the files' contents.
// This is so because the font generation script uses the timestamp to
// generate the fonts, therefore when checking against a stock file 
// they'll differ.  

describe('testing command compile', function() {
  this.slow(2000);

  after(function() {
    del(__dirname + '/../collecticons');
    del(__dirname + '/results/test-compile');
  });

  beforeEach(function() {
    del(__dirname + '/results/test-compile');
  });

  // Start tests.
  it("should work with default values", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/'
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      var expected = [
        'styles/_icons.scss',
        'preview.html',
        'font/collecticons.woff',
        'font/collecticons.ttf',
        'font/collecticons.eot'
      ];
      expected.forEach(function(f) {
        assert.equal(existsSync(__dirname + '/../collecticons/' + f), true);
      });
      done();
    });

  });

  it("should work with different destination paths", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--style-dest', __dirname + '/results/test-compile',
      '--preview-dest', __dirname + '/results/test-compile',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      var expected = [
        '_icons.scss',
        'preview.html',
        'collecticons.woff',
        'collecticons.ttf',
        'collecticons.eot'
      ];
      expected.forEach(function(f) {
        assert.equal(existsSync(__dirname + '/results/test-compile/' + f), true, 'Missing: ' + f);
      });
      done();
    });
  });

  it("should not output preview", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--style-dest', __dirname + '/results/test-compile',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/preview.html'), false);
      done();
    });
  });

  it("should output catalog", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--style-dest', __dirname + '/results/test-compile',
      '--catalog-dest', __dirname + '/results/test-compile',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/catalog.json'), true);
      done();
    });
  });

  it("should output only woff font", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--font-types', 'woff',
      '--style-dest', __dirname + '/results/test-compile',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.woff'), true);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.eot'), false);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.ttf'), false);
      done();
    });
  });

  it("should output woff and ttf font", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--font-types', 'woff,ttf',
      '--style-dest', __dirname + '/results/test-compile',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.woff'), true);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.eot'), false);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.ttf'), true);
      done();
    });
  });

  it("should not output woff and ttf font because of embed", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--font-embed',
      '--style-dest', __dirname + '/results/test-compile',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.woff'), false);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.eot'), true);
      assert.equal(existsSync(__dirname + '/results/test-compile/collecticons.ttf'), false);
      done();
    });
  });

  it("should output css and sass files", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--font-dest', __dirname + '/results/test-compile',
      '--style-dest', __dirname + '/results/test-compile',
      '--style-format', 'css,sass',
      '--no-preview',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-compile/icons.css'), true);
      assert.equal(existsSync(__dirname + '/results/test-compile/_icons.scss'), true);
      done();
    });
  });

  it("should output css and sass files with custom name", function(done) {
    var args = [
      collecticons,
      'compile',
      __dirname + '/fixtures/add_icon/',
      '--style-format', 'css,sass',
      '--style-name', 'custom-name',
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      var expected = [
        'styles/_custom-name.scss',
        'styles/custom-name.css'
      ];
      expected.forEach(function(f) {
        assert.equal(existsSync(__dirname + '/../collecticons/' + f), true);
      });
      done();
    });
  });
});

function existsSync(filePath){
  try {
    fs.statSync(filePath);
  }
  catch (err) {
    if (err.code == 'ENOENT') {
      return false;
    }
    throw err;
  }
  return true;
};
