const path = require('path');
const fs = require('fs-extra');
const { assert } = require('chai');

const compile = require('../src/core/compile');

describe('Command: compile', function () {
  it('Should throw error when sassPlaceholder and cssClass are both false', async function () {
    try {
      await compile({
        dirPath: __dirname, // not important in this test
        sassPlaceholder: false,
        cssClass: false
      });
    } catch (error) {
      const msgs = error.details;
      assert.isTrue(error.userError);
      assert.deepEqual(msgs, [
        'Error: sassPlaceholder and/or cssClass are required'
      ]);
      assert.equal(error.code, 'PLC_CLASS_EXC');
      return;
    }

    // Failsafe.
    assert.fail('Error not thrown');
  });

  it('Should throw error when invalid font type is used', async function () {
    try {
      await compile({
        dirPath: __dirname, // not important in this test
        fontTypes: ['invalid']
      });
    } catch (error) {
      const msgs = error.details;
      assert.isTrue(error.userError);
      assert.deepEqual(msgs, [
        'Error: invalid font type value'
      ]);
      assert.equal(error.code, 'FONT_TYPE');
      return;
    }

    // Failsafe.
    assert.fail('Error not thrown');
  });

  it('Should throw error when invalid style format is used', async function () {
    try {
      await compile({
        dirPath: __dirname, // not important in this test
        styleFormats: ['invalid']
      });
    } catch (error) {
      const msgs = error.details;
      assert.isTrue(error.userError);
      assert.deepEqual(msgs, [
        'Error: invalid style format value'
      ]);
      assert.equal(error.code, 'STYLE_TYPE');
      return;
    }

    // Failsafe.
    assert.fail('Error not thrown');
  });

  it('Should not output anything if there are no icons in specified directory', async function () {
    const dest = path.resolve(__dirname, 'test-run/no-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest
    });

    let exists;
    try {
      await fs.access(dest);
      exists = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      exists = false;
    }

    assert.isFalse(exists);
  });
});

// - put ticket out about style component (overarching goal of reusable practices - OKR)
