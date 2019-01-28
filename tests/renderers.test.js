const path = require('path');
const fs = require('fs-extra');
const { assert } = require('chai');

const { renderSass, renderCss, renderCatalog, renderPreview } = require('../src/renderers');

const renderSassBase = {
  fontName: 'collecticons',

  embed: true,

  fonts: {
    woff: {
      contents: Buffer.from('woff font'),
      path: 'fonts/collecticons.woff'
    },
    woff2: {
      contents: Buffer.from('woff2 font'),
      path: 'fonts/collecticons.woff2'
    }
  },

  authorName: 'Development Seed',
  authorUrl: 'https://developmentseed.org/',

  className: 'collecticons',

  icons: [
    {
      name: 'book',
      codepoint: 0xf101
    },
    {
      name: 'chevron-left',
      codepoint: 0xf102
    }
  ],

  sassPlaceholder: true,
  cssClass: true,

  dateFormatted: 'January 1st, 2019'
};

const renderCssBase = {
  fontName: 'collecticons',

  embed: true,

  fonts: {
    woff: {
      contents: Buffer.from('woff font'),
      path: 'fonts/collecticons.woff'
    },
    woff2: {
      contents: Buffer.from('woff2 font'),
      path: 'fonts/collecticons.woff2'
    }
  },

  authorName: 'Development Seed',
  authorUrl: 'https://developmentseed.org/',

  className: 'collecticons',

  icons: [
    {
      name: 'book',
      codepoint: 0xf101
    },
    {
      name: 'chevron-left',
      codepoint: 0xf102
    }
  ],

  dateFormatted: 'January 1st, 2019'
};

describe('Renderers', function () {
  describe('renderSass', function () {
    it('Throw error when variables are missing', async function () {
      try {
        await renderSass();
      } catch (error) {
        assert.instanceOf(error, ReferenceError);
        return;
      }
      assert.fail('Error not thrown');
    });

    it('Render the sass file with base render settings', async function () {
      const result = await renderSass(renderSassBase);

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderSass/renderSass-embed-sass-css.scss'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the sass file without embedding the font', async function () {
      const result = await renderSass({
        ...renderSassBase,
        embed: false
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderSass/renderSass-nonembed-sass-css.scss'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the sass file only with placeholders', async function () {
      const result = await renderSass({
        ...renderSassBase,
        cssClass: false
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderSass/renderSass-embed-sass.scss'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the sass file only with css classes', async function () {
      const result = await renderSass({
        ...renderSassBase,
        sassPlaceholder: false
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderSass/renderSass-embed-css.scss'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the sass file with only woff2 font', async function () {
      const result = await renderSass({
        ...renderSassBase,
        fonts: {
          woff2: {
            contents: Buffer.from('woff2 font'),
            path: 'fonts/collecticons.woff2'
          }
        }
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderSass/renderSass-embed-sass-css-woff2.scss'), 'utf8');
      assert.equal(result, expected);
    });
  });

  describe('renderCss', function () {
    it('Throw error when variables are missing', async function () {
      try {
        await renderCss();
      } catch (error) {
        assert.instanceOf(error, ReferenceError);
        return;
      }
      assert.fail('Error not thrown');
    });

    it('Render the css file with base render settings', async function () {
      const result = await renderCss(renderCssBase);

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderCss/renderCss-embed.css'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the css file without embedding the font', async function () {
      const result = await renderCss({
        ...renderCssBase,
        embed: false
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderCss/renderCss-nonembed.css'), 'utf8');
      assert.equal(result, expected);
    });

    it('Render the css file with only woff2 font', async function () {
      const result = await renderCss({
        ...renderCssBase,
        fonts: {
          woff2: {
            contents: Buffer.from('woff2 font'),
            path: 'fonts/collecticons.woff2'
          }
        }
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderCss/renderCss-embed-woff2.css'), 'utf8');
      assert.equal(result, expected);
    });
  });

  describe('renderCatalog', function () {
    it('Throw error when variables are missing', async function () {
      try {
        await renderCatalog();
      } catch (error) {
        assert.instanceOf(error, ReferenceError);
        return;
      }
      assert.fail('Error not thrown');
    });

    it('Render catalog as json', async function () {
      const result = await renderCatalog({
        fontName: 'collecticons',
        className: 'collecticons',
        icons: [
          {
            name: 'book',
            codepoint: 0xf101
          },
          {
            name: 'chevron-left',
            codepoint: 0xf102
          }
        ]
      });

      const expected = JSON.stringify({
        name: 'collecticons',
        className: 'collecticons',
        icons: [
          {
            icon: 'collecticons-book',
            charCode: '\\F101'
          },
          {
            icon: 'collecticons-chevron-left',
            charCode: '\\F102'
          }
        ]
      });

      assert.equal(result, expected);
    });
  });

  describe('renderPreview', function () {
    it('Throw error when variables are missing', async function () {
      try {
        await renderPreview();
      } catch (error) {
        assert.instanceOf(error, ReferenceError);
        return;
      }
      assert.fail('Error not thrown');
    });

    it('Render the html preview', async function () {
      const result = await renderPreview({
        fontName: 'collecticons',

        font: {
          // Preview is always embedded and always woff2.
          contents: Buffer.from('woff2 font')
          // There's no need for path.
        },

        className: 'collecticons',

        icons: [
          {
            name: 'book',
            codepoint: 0xf101
          },
          {
            name: 'chevron-left',
            codepoint: 0xf102
          }
        ]
      });

      const expected = await fs.readFile(path.resolve(__dirname, 'expected/renderPreview/renderPreview-expected.html'), 'utf8');
      assert.equal(result, expected);
    });
  });
});
