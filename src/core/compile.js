const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const { logger, userError, validateDirPath } = require('../utils');
const generateFont = require('../font-generator');
const { renderSass } = require('../renderers');

const defaults = {
  fontName: 'collecticons',
  fontTypes: ['woff2'],

  // useFontFiles: undefined by default.
  //    If defined has to be a valid folder path and fonts will be output
  //    instead of embedded.

  authorName: 'Development Seed',
  authorUrl: 'https://developmentseed.org/',

  className: 'collecticons',
  styleName: 'icons',
  styleFormats: ['sass'],
  styleDest: 'collecticons/styles/',

  sassPlaceholder: true,
  cssClass: true,

  previewDest: 'collecticons/styles/',
  preview: true

  // catalogDest: undefined by default.
  //    If defined has to be a valid folder path and catalog will be output.
};

const validFontTypes = ['woff', 'woff2'];
const validStyleFormats = ['css', 'sass'];

async function collecticonsCompile (params) {
  const {
    dirPath,
    fontName,
    sassPlaceholder,
    cssClass,
    fontTypes,
    styleFormats
  } = _.defaultsDeep({}, params, defaults);

  await validateDirPath(dirPath);

  // TODO. debug logs

  // Validate options incompatibility.
  if (!sassPlaceholder && !cssClass) {
    throw userError(['Error: sassPlaceholder and/or cssClass are required'], 'PLC_CLASS_EXC');
  }

  logger.debug('Font types:', fontTypes);
  if (fontTypes.some(t => validFontTypes.indexOf(t) === -1)) {
    throw userError(['Error: invalid font type value'], 'FONT_TYPE');
  }

  logger.debug('Styles formats:', fontTypes);
  if (styleFormats.some(t => validStyleFormats.indexOf(t) === -1)) {
    throw userError(['Error: invalid style format value'], 'STYLE_TYPE');
  }

  const dir = await fs.readdir(dirPath);
  const svgsFiles = dir.filter(o => o.endsWith('.svg'));

  logger.debug('Found', svgsFiles.length, 'icons in', dir);

  if (!svgsFiles.length) {
    logger.warn('No icons found in', dirPath);
    return;
  }

  // Unicode Private Use Area start.
  // http://en.wikipedia.org/wiki/Private_Use_(Unicode)
  let currentCodepoint = 0xf101;

  // Generates codepoints for each icon.
  const icons = svgsFiles.map(svg => ({
    file: path.resolve('.', dirPath, svg),
    name: path.basename(svg, path.extname(svg)),
    codepoint: currentCodepoint++
  }));

  const fonts = await generateFont({
    fontName,
    formatOptions: {},
    icons
  });

  if (styleFormats.indexOf('sass') !== -1) {
    const sassContent = renderSass();
  }
}

module.exports = collecticonsCompile;

if (process.env.NODE_ENV === 'debug') {
  collecticonsCompile();
}
