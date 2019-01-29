const path = require('path');
const fs = require('fs-extra');
const { assert } = require('chai');

const compile = require('../src/core/compile');

// Compile program arguments
// fontName - Affects the output of font files
// fontTypes - Affects the output of font files

// fontDest - Affects the output of font files

// authorName - Only affects file content. Tested in the font-generator
// authorUrl - Only affects file content. Tested in the font-generator

// className - Only affects file content. Tested in the font-generator
// styleName - Affects the output of style files
// styleFormats - Affects the output of style files
// styleDest - Affects the output of style files

// sassPlaceholder - Only affects file content. Tested in the font-generator
// cssClass - Only affects file content. Tested in the font-generator

// previewDest - Affects the output of preview file
// preview - Affects the output of preview file

// catalogDest - Affects the output of catalog file

describe('Command: compile', function () {
  it('Throw error when sassPlaceholder and cssClass are both false', async function () {
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

  it('Throw error when cssClass is false and style formats is only css', async function () {
    try {
      await compile({
        dirPath: __dirname, // not important in this test
        cssClass: false,
        styleFormats: ['css']
      });
    } catch (error) {
      const msgs = error.details;
      assert.isTrue(error.userError);
      assert.deepEqual(msgs, [
        'Error: cssClass can not be false when styleFormats is only css'
      ]);
      assert.equal(error.code, 'CLASS_CSS_FORMAT');
      return;
    }

    // Failsafe.
    assert.fail('Error not thrown');
  });

  it('Throw error when invalid font type is used', async function () {
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

  it('Throw error when invalid style format is used', async function () {
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

  it('Do not output anything if there are no icons in specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/no-output');
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

  it('Output only default files to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/default-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest
    });

    const dir = await fs.readdir(dest);
    const preview = dir.find(f => f.endsWith('.html'));
    const scss = dir.find(f => f.endsWith('.scss'));
    const catalog = dir.find(f => f.endsWith('.json'));
    const woff2 = dir.find(f => f.endsWith('.woff2'));
    assert.isOk(preview);
    assert.isOk(scss);
    assert.isUndefined(catalog);
    assert.isUndefined(woff2);

    // Clean up.
    await fs.remove(dest);
  });

  it('Output all specified styles files to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/all-styles-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest,
      styleFormats: ['sass', 'css']
    });

    await fs.readFile(path.resolve(dest, 'icons.scss'));
    await fs.readFile(path.resolve(dest, 'icons.css'));

    // Clean up.
    await fs.remove(dest);
  });

  it('Output all specified styles files with custom name to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/all-styles-custom-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest,
      styleFormats: ['sass', 'css'],
      styleName: 'custom'
    });

    await fs.readFile(path.resolve(dest, 'custom.scss'));
    await fs.readFile(path.resolve(dest, 'custom.css'));

    // Clean up.
    await fs.remove(dest);
  });

  it('Output all specified font files to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/all-fonts-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest,
      fontDest: dest,
      fontTypes: ['woff', 'woff2']
    });

    await fs.readFile(path.resolve(dest, 'collecticons.woff'));
    await fs.readFile(path.resolve(dest, 'collecticons.woff2'));

    // Clean up.
    await fs.remove(dest);
  });

  it('Output all specified font files with custom name to specified directory', async function () {
    const dest = path.resolve(__dirname, '../test-run/all-fonts-custom-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest,
      fontDest: dest,
      fontName: 'custom',
      fontTypes: ['woff', 'woff2']
    });

    await fs.readFile(path.resolve(dest, 'custom.woff'));
    await fs.readFile(path.resolve(dest, 'custom.woff2'));

    // Clean up.
    await fs.remove(dest);
  });

  it('Output files according to specified directories', async function () {
    const dest = path.resolve(__dirname, '../test-run/different-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: path.resolve(dest, 'styles'),
      previewDest: path.resolve(dest, 'preview'),
      catalogDest: path.resolve(dest, 'catalog'),
      fontDest: path.resolve(dest, 'fonts')
    });

    await fs.readFile(path.resolve(dest, 'styles/icons.scss'));
    await fs.readFile(path.resolve(dest, 'preview/preview.html'));
    await fs.readFile(path.resolve(dest, 'catalog/catalog.json'));
    await fs.readFile(path.resolve(dest, 'fonts/collecticons.woff2'));

    // Clean up.
    await fs.remove(dest);
  });

  it('Do not output preview file when disabled', async function () {
    const dest = path.resolve(__dirname, '../test-run/no-preview-output');
    await compile({
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
      // Set all the paths.
      styleDest: dest,
      previewDest: dest,
      preview: false
    });

    const dir = await fs.readdir(dest);
    const preview = dir.find(f => f === 'preview.html');
    assert.isUndefined(preview);

    // Clean up.
    await fs.remove(dest);
  });

  it('Do not write files when using the noFileOutput parameter', async function () {
    const dest = path.resolve(__dirname, '../test-run/no-output');
    const result = await compile({
      noFileOutput: true,
      dirPath: path.resolve(__dirname, 'fixtures/icons'),
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
    assert.lengthOf(result, 2);

    // Clean up.
    await fs.remove(dest);
  });
});
