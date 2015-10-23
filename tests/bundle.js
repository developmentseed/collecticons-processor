var fs = require('fs');
var cp = require('child_process');
var assert = require('assert');
var del = require('del');
var Decompress = require('decompress');
var collecticons = __dirname + '/../bin/collecticons.js';


describe('testing command bundle', function() {
  this.slow(2000);

  after(function() {
    del(__dirname + '/results/test-bundle/');
  });

  it("should output zip file", function(done) {

    var args = [
      collecticons,
      'bundle',
      __dirname + '/fixtures/add_icon/', __dirname + '/results/test-bundle/collecticons.test.zip'
    ];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(existsSync(__dirname + '/results/test-bundle/collecticons.test.zip'), true);

      var zipContents = [
        'icons.css',
        'preview.html',
        'svg/add.svg',
        'font/collecticons.woff',
        'font/collecticons.ttf',
        'font/collecticons.eot',
      ];

      // unzip and check contents.
      new Decompress({mode: '755'})
       .src(__dirname + '/results/test-bundle/collecticons.test.zip')
       .dest(__dirname + '/results/test-bundle')
       .use(Decompress.zip())
       .run(function() {

          zipContents.forEach(function(f) {
            assert.equal(existsSync(__dirname + '/results/test-bundle/' + f), true, 'Missing ' + f);
          });

        done();
       });

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
