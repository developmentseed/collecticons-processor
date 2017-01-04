var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var assert = require('assert');
var del = require('del');
var decompress = require('decompress');
var collecticons = path.join(__dirname, '/../bin/collecticons.js');

describe('testing command bundle', function () {
  this.slow(2000);

  after(function () {
    del(path.join(__dirname, '/results/test-bundle/'));
  });

  it('should output zip file', function (done) {
    var args = [
      collecticons,
      'bundle',
      path.join(__dirname, '/fixtures/add_icon/'), path.join(__dirname, '/results/test-bundle/collecticons.test.zip')
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function (code) {
      assert.equal(existsSync(path.join(__dirname, '/results/test-bundle/collecticons.test.zip')), true);

      var zipContents = [
        'icons.css',
        'preview.html',
        'svg/add.svg',
        'font/collecticons.woff',
        'font/collecticons.ttf',
        'font/collecticons.eot'
      ];

      // unzip and check contents.
      var src = path.join(__dirname, '/results/test-bundle/collecticons.test.zip');
      var dist = path.join(__dirname, '/results/test-bundle');
      decompress(src, dist).then(function (files) {
        zipContents.forEach(function (f) {
          assert.equal(existsSync(path.join(__dirname, '/results/test-bundle/', f)), true, 'Missing ' + f);
        });
        done();
      });
    });
  });
});

function existsSync (filePath) {
  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
  return true;
}
