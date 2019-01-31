const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');

/**
 * Renders the css file using the `css.ejs` template.
 *
 * @param {object} opts Option for the generation.
 * @param {string} opts.fontName Name of the font to render.
 * @param {string} opts.embed Whether or not to embed the fonts defined in the
 *                 `fonts` option.
 * @param {object} opts.fonts Fonts to use. Only `woff` and `woff2` are supported.
 *                 The object key should be the font type and each should have
 *                 a contents in Buffer format and a path to  the font File.
 *                 The path is not needed if embed is set to `true`. Example:
 *                 woff: {
 *                   contents: Buffer
 *                   path: String
 *                 }
 * @param {string} opts.authorName Name of the font author.
 *                 Will go into the style header comment.
 * @param {string} opts.authorUrl Url of the font author.
 *                 Will go into the style header comment.
 * @param {string} opts.className Class name / sass placeholder to use.
 * @param {array} opts.icons List of icons. Each should have a `name` and
 *                `codepoint` properties.boolean
 * @param {boolean} opts.cssClass Whether or not to use css classes.
 * @param {string} opts.dateFormatted Generation date.
 *                 Will go into the style header comment.
 *
 * @returns {string} Rendered data
 */
async function renderCss (opts) {
  const tpl = await fs.readFile(path.resolve(__dirname, 'css.ejs'), 'utf8');
  return ejs.render(tpl, opts);
}

/**
 * Renders the sass file using the `sass.ejs` template.
 *
 * @param {object} opts Option for the generation.
 * @param {string} opts.fontName Name of the font to render.
 * @param {string} opts.embed Whether or not to embed the fonts defined in the
 *                 `fonts` option.
 * @param {object} opts.fonts Fonts to use. Only `woff` and `woff2` are supported.
 *                 The object key should be the font type and each should have
 *                 a contents in Buffer format and a path to  the font File.
 *                 The path is not needed if embed is set to `true`. Example:
 *                 woff: {
 *                   contents: Buffer
 *                   path: String
 *                 }
 * @param {string} opts.authorName Name of the font author.
 *                 Will go into the style header comment.
 * @param {string} opts.authorUrl Url of the font author.
 *                 Will go into the style header comment.
 * @param {string} opts.className Class name / sass placeholder to use.
 * @param {array} opts.icons List of icons. Each should have a `name` and
 *                `codepoint` properties.boolean
 * @param {boolean} opts.sassPlaceholder Whether or not to use sass placeholders.
 * @param {boolean} opts.cssClass Whether or not to use css classes.
 * @param {string} opts.dateFormatted Generation date.
 *                 Will go into the style header comment.
 *
 * @returns {string} Rendered data
 */
async function renderSass (opts = {}) {
  const tpl = await fs.readFile(path.resolve(__dirname, 'sass.ejs'), 'utf8');
  return ejs.render(tpl, opts);
}

/**
 * Renders the preview file using the `html.ejs` template.
 *
 * @param {object} opts Option for the generation.
 * @param {string} opts.fontName Name of the font to render.
 * @param {Buffer} opts.font.contents Contents of the woff2 font.
 * @param {string} opts.className Class name / sass placeholder to use.
 * @param {array} opts.icons List of icons. Each should have a `name` and
 *                `codepoint` properties.boolean
 *
 * @returns {string} Rendered data
 */
async function renderPreview (opts = {}) {
  const tpl = await fs.readFile(path.resolve(__dirname, 'html.ejs'), 'utf8');
  return ejs.render(tpl, opts);
}

/**
 * Renders the catalog file returning a json string.
 *
 * @param {object} opts Option for the generation.
 * @param {string} opts.fontName Name of the font to render.
 * @param {string} opts.className Class name / sass placeholder to use.
 * @param {object} opts.fonts Fonts to include as base64 strings.
 *                 Each object key is the font type and its value is the
 *                 encoded string.
 * @param {array} opts.icons List of icons. Each should have a `name` and
 *                `codepoint` properties.boolean
 *
 * @returns {string} Rendered data
 */
async function renderCatalog (opts = {}) {
  if (!opts.fontName) throw new ReferenceError('fontName is undefined');
  if (!opts.className) throw new ReferenceError('className is undefined');
  if (!opts.icons || !opts.icons.length) throw new ReferenceError('icons is undefined or empty');

  const fonts = opts.fonts
    ? Object.keys(opts.fonts).reduce((acc, name) => {
      return {
        ...acc,
        [name]: opts.fonts[name].contents.toString('base64')
      };
    }, {})
    : null;

  return JSON.stringify({
    name: opts.fontName,
    className: opts.className,
    fonts,
    icons: opts.icons.map(i => ({
      icon: `${opts.className}-${i.name}`,
      charCode: `\\${i.codepoint.toString(16).toUpperCase()}`
    }))
  });
}

module.exports = {
  renderCss,
  renderSass,
  renderPreview,
  renderCatalog
};
