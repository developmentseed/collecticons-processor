const path = require('path');
const fs = require('fs-extra');
const JSZip = require('node-zip');
const { assert } = require('chai');

const bundle = require('../src/core/bundle');

describe('Command: bundle', function () {
  it('Throw error when destFile is invalid', async function () {
    try {
      await bundle({
        dirPath: path.resolve(__dirname, './fixtures/icons'), // not important in this test
        destFile: false
      });
    } catch (error) {
      assert.instanceOf(error, TypeError);
      return;
    }

    // Failsafe.
    assert.fail('Error not thrown');
  });

  it('Do not output anything if there are no icons in specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/bundle-no-output/file.zip');
    await bundle({
      dirPath: path.resolve(__dirname, 'fixtures'),
      destFile: dest
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

  it('Output zip file to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/bundle-output');
    await bundle({
      dirPath: path.resolve(__dirname, 'fixtures/small-icons'),
      destFile: path.resolve(dest, 'file.zip')
    });

    const zipFile = await fs.readFile(path.resolve(dest, 'file.zip'));

    // Verify contents.
    let zip = new JSZip(zipFile, { base64: false, checkCRC32: true });

    assert.hasAllKeys(zip.files, [
      'collecticons.woff',
      'collecticons.woff2',
      'styles/icons.css',
      'preview.html',
      'icons/book.svg',
      'icons/chevron-left.svg'
    ]);

    // Clean up.
    await fs.remove(dest);
  });
});
