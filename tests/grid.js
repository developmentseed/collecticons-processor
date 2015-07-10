var fs = require('fs');
var cp = require('child_process');
var assert = require('assert');
var collecticons = __dirname + '/../bin/collecticons.js';

describe('testing command grid', function() {
  it("should remove grid from svg", function(done) {

    var args = [collecticons, 'grid', '-r', __dirname + '/fixtures/add_icon/', 'tests/results'];

    cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', function(code) {
      assert.equal(
        fs.readFileSync(__dirname + '/results/add.svg', {encoding: 'utf8'}),
        fs.readFileSync(__dirname + '/expected/add.svg', {encoding: 'utf8'})
      );
      done();
    });

  });
});