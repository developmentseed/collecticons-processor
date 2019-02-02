const { logger } = require('../src/utils');

logger.setLevel(0);

describe('Collecticons', function () {
  require('./utils.test');
  require('./font-generator.test');
  require('./renderers.test');
  require('./compile-prog.test');
  require('./bundle-prog.test.js');
});
