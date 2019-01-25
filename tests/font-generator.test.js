const { assert } = require('chai');
const path = require('path');

const generateFonts = require('../src/font-generator');

describe('Font generator', function () {
  it('Should throw error when called without fontName', async function () {
    try {
      await generateFonts();
    } catch (error) {
      assert.instanceOf(error, TypeError);
      assert.equal(error.message, 'Missing fontName argument');
      return;
    }
    assert.fail('Error not thrown');
  });

  it('Should throw error when called without icons', async function () {
    try {
      await generateFonts({ fontName: 'collecticons' });
    } catch (error) {
      assert.instanceOf(error, TypeError);
      assert.equal(error.message, 'Invalid or empty icons argument');
      return;
    }
    assert.fail('Error not thrown');
  });

  it('Should throw error when called with non array icons', async function () {
    try {
      await generateFonts({ fontName: 'collecticons', icons: 'this' });
    } catch (error) {
      assert.instanceOf(error, TypeError);
      assert.equal(error.message, 'Invalid or empty icons argument');
      return;
    }
    assert.fail('Error not thrown');
  });

  it('Should throw error when called with empty icons', async function () {
    try {
      await generateFonts({ fontName: 'collecticons', icons: [] });
    } catch (error) {
      assert.instanceOf(error, TypeError);
      assert.equal(error.message, 'Invalid or empty icons argument');
      return;
    }
    assert.fail('Error not thrown');
  });

  it('Should return an object with all the generated fonts', async function () {
    const icons = [
      {
        file: path.resolve(__dirname, 'fixtures/small-icons/book.svg'),
        name: 'book',
        codepoint: 0xf101
      },
      {
        file: path.resolve(__dirname, 'fixtures/small-icons/chevron-left.svg'),
        name: 'chevron-left',
        codepoint: 0xf102
      }
    ];

    const fonts = await generateFonts({
      fontName: 'collecticons',
      icons
    });

    assert.hasAllKeys(fonts, ['svg', 'ttf', 'woff', 'woff2']);
  });
});
