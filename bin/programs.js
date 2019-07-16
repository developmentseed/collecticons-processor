const pick = require('lodash.pick');

const { validateDirPathForCLI } = require('../src/utils');

const {
  compile: collecticonsCompile,
  bundle: collecticonsBundle
} = require('../src');

/**
 * Collecticons compile wrapped for use in the CLI tool.
 */
async function compileProgram (dirPath, command) {
  await validateDirPathForCLI(dirPath);
  const params = pick(command, [
    'fontName',
    'sassPlaceholder',
    'cssClass',
    'fontTypes',
    'styleFormats',
    'styleDest',
    'styleName',
    'fontDest',
    'authorName',
    'authorUrl',
    'className',
    'previewDest',
    'preview',
    'rescale',
    'catalogDest',

    'experimentalFontOnCatalog',
    'experimentalDisableStyles'
  ]);

  try {
    return collecticonsCompile({
      dirPath,
      ...params
    });
  } catch (error) {
    if (!error.userError) throw error;
    // Capture some errors and convert to their command line alternative.
    const code = error.code;
    if (code === 'PLC_CLASS_EXC') {
      error.details = ['Error: --no-sass-placeholder and --no-css-class are mutually exclusive'];
    } else if (code === 'FONT_TYPE') {
      error.details = ['Error: invalid font type value passed to --font-types'];
    } else if (code === 'CLASS_CSS_FORMAT') {
      error.details = ['Error: "--no-css-class" and "--style-formats css" are not compatible'];
    } else if (code === 'STYLE_TYPE') {
      error.details = ['Error: invalid style format value passed to --style-format'];
    }

    throw error;
  }
}

/**
 * Collecticons bundle wrapped for use in the CLI tool.
 */
async function bundleProgram (dirPath, destFile) {
  await validateDirPathForCLI(dirPath);
  return collecticonsBundle({
    dirPath,
    destFile
  });
}

module.exports = {
  compileProgram,
  bundleProgram
};
