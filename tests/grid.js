var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var assert = require('assert');
var del = require('del');
var collecticons = path.join(__dirname, '/../bin/collecticons.js');

describe('testing command grid', function () {
  this.slow(2000);

  after(function () {
    del(path.join(__dirname, '/results/test-grid/'));
  });

  it('should remove grid from svg', function (done) {
    var args = [collecticons, 'grid', '-r', path.join(__dirname, '/fixtures/add_icon/'), path.join(__dirname, '/results/test-grid')];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function (code) {
      assert.equal(
        fs.readFileSync(path.join(__dirname, '/results/test-grid/add.svg'), {encoding: 'utf8'}),
        fs.readFileSync(path.join(__dirname, '/expected/add.svg'), {encoding: 'utf8'})
      );
      done();
    });
  });
});
