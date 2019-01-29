const fs = require('fs-extra');
const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');

const {
  logger,
  userError,
  validateDirPath,
  formatHumanDate
} = require('../utils');
const { renderSass,
  renderCss,
  renderPreview,
  renderCatalog
} = require('../renderers');
const generateFont = require('../font-generator');

const defaults = {
  fontName: 'collecticons',
  fontTypes: ['woff2'],

  // fontDest: undefined by default.

  authorName: 'Development Seed',
  authorUrl: 'https://developmentseed.org/',

  className: 'collecticons',
  styleName: 'icons',
  styleFormats: ['sass'],
  styleDest: 'collecticons/styles/',

  sassPlaceholder: true,
  cssClass: true,

  previewDest: 'collecticons/',
  preview: true

  // catalogDest: undefined by default.

  // noFileOutput: undefiend by default
};

const validFontTypes = ['woff', 'woff2'];
const validStyleFormats = ['css', 'sass'];

/**
 * Compiles the collecticons font and associated styles, catalog and preview
 * files.
 *
 * @param {objec} params
 * @param {string} params.dirPath Source path for the svg icons.
 * @param {string} params.fontName Font name. Default: 'collecticons'
 * @param {array} params.fontTypes List of fonts to create. Only `woff` and
 *                `woff2` are supported. Default to ['woff2']
 * @param {string} params.fontDest If defined has to be a valid folder path and
 *                 fonts will be output instead of embedded. Default undefined.
 * @param {string} params.authorName Author name for meta information.
 *                 Default 'Development Seed'
 * @param {string} params.authorUrl Author url for meta information.
 *                 Default 'https://developmentseed.org/'
 * @param {string} params.className Class name for sass and css files.
 *                 Default 'collecticons'
 * @param {string} params.styleName Style file name. `scss` and `css` extensions
 *                 will be using according to the generated file.
 *                 Default 'icons'
 * @param {array} params.styleFormats List of style files to create. Only `css`
 *                 and `sass` are supported. Default to ['scss']
 * @param {string} params.styleDest Output destination for the style files.
 *                 Default 'collecticons/styles/'
 * @param {boolean} params.sassPlaceholder Whether or not to render sass
 *                 placeholders. Only valid for sass style. Default true
 * @param {boolean} params.cssClass Whether or not to render css classes.
 *                 Default true
 * @param {string} params.previewDest Output destination for the preview file.
 *                 Default 'collecticons/'
 * @param {boolean} params.preview Whether or not to render the preview file.
 *                 Default true
 * @param {string} params.catalogDest If defined has to be a valid folder path
 *                 and catalog will be output. Default undefined.
 * @param {boolean} params.noFileOutput If set to true a list of files and their
 *                 content is returned instead of writing the files to disk.
 *                 Default undefined.
 */
async function collecticonsCompile (params) {
  const {
    dirPath,
    fontName,
    sassPlaceholder,
    cssClass,
    fontTypes,
    styleFormats,
    styleDest,
    styleName,
    fontDest,
    authorName,
    authorUrl,
    className,
    previewDest,
    preview,
    catalogDest,
    noFileOutput
  } = defaultsDeep({}, params, defaults);

  await validateDirPath(dirPath);

  // Validate options incompatibility.
  if (!sassPlaceholder && !cssClass) {
    throw userError(['Error: sassPlaceholder and/or cssClass are required'], 'PLC_CLASS_EXC');
  }

  logger.debug('Font types:', fontTypes);
  if (fontTypes.some(t => validFontTypes.indexOf(t) === -1)) {
    throw userError(['Error: invalid font type value'], 'FONT_TYPE');
  }

  logger.debug('Styles formats:', styleFormats);
  if (styleFormats.some(t => validStyleFormats.indexOf(t) === -1)) {
    throw userError(['Error: invalid style format value'], 'STYLE_TYPE');
  }

  // Verify cssClass with styleFormats.
  if (styleFormats.length === 1 && styleFormats[0] === 'css' && !cssClass) {
    throw userError(['Error: cssClass can not be false when styleFormats is only css'], 'CLASS_CSS_FORMAT');
  }

  // Warn about ignores cssCalss for css style when there is more than one style
  if (styleFormats.indexOf('css') !== -1 && !cssClass) {
    logger.warn('cssClass value "false" will be ignored for "css" output.');
  }

  const dir = await fs.readdir(dirPath);
  const svgsFiles = dir.filter(o => o.endsWith('.svg'));

  logger.debug('Found', svgsFiles.length, 'icons in', dirPath);
  logger.debug(dir);

  if (!svgsFiles.length) {
    logger.warn('No icons found in', dirPath);
    return null;
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
    icons
  });

  // Store all files to be, so that they can be written to disk.
  let virtualFiles = [
    // {
    //   path: String
    //   contents: Buffer
    // }
  ];

  if (fontDest) {
    logger.debug('Font embed disabled. Fonts will be rendered to', fontDest);
    virtualFiles = virtualFiles.concat(
      fontTypes.map(type => ({
        path: path.join(fontDest, `${fontName}.${type}`),
        contents: fonts[type]
      }))
    );
  }

  let includedFonts = {};
  if (fontTypes.indexOf('woff') !== -1) {
    includedFonts = {
      ...includedFonts,
      woff: {
        contents: fonts.woff,
        path: path.relative(styleDest, path.join(fontDest || '', `${fontName}.woff`))
      }
    };
  }

  if (fontTypes.indexOf('woff2') !== -1) {
    includedFonts = {
      ...includedFonts,
      woff2: {
        contents: fonts.woff2,
        path: path.relative(styleDest, path.join(fontDest || '', `${fontName}.woff2`))
      }
    };
  }

  const styleOptions = {
    fontName,
    embed: !fontDest,
    fonts: includedFonts,
    authorName,
    authorUrl,
    className,
    icons,
    sassPlaceholder,
    cssClass,
    dateFormatted: process.env.NODE_ENV === 'test' ? 'January 1st, 2019' : formatHumanDate(new Date())
  };

  if (styleFormats.indexOf('sass') !== -1) {
    logger.debug('Rendering sass file');
    virtualFiles = virtualFiles.concat({
      path: path.join(styleDest, `${styleName}.scss`),
      contents: Buffer.from(await renderSass(styleOptions))
    });
  }

  if (styleFormats.indexOf('css') !== -1) {
    logger.debug('Rendering css file');
    virtualFiles = virtualFiles.concat({
      path: path.join(styleDest, `${styleName}.css`),
      contents: Buffer.from(await renderCss(styleOptions))
    });
  }

  if (preview) {
    logger.debug('Rendering preview file');
    virtualFiles = virtualFiles.concat({
      path: path.join(previewDest, 'preview.html'),
      contents: Buffer.from(await renderPreview({
        fontName,
        font: { contents: fonts.woff2 },
        className,
        icons
      }))
    });
  }

  if (catalogDest) {
    logger.debug('Rendering catalog file');
    virtualFiles = virtualFiles.concat({
      path: path.join(catalogDest, 'catalog.json'),
      contents: Buffer.from(await renderCatalog({
        fontName,
        className,
        icons
      }))
    });
  }

  logger.debug('All files rendered');
  logger.debug(virtualFiles);

  if (noFileOutput) return virtualFiles;

  return Promise.all(virtualFiles.map(async (file) => {
    await fs.ensureDir(path.dirname(file.path));
    await fs.writeFile(file.path, file.contents);
  }));
}

module.exports = collecticonsCompile;

if (process.env.NODE_ENV === 'debug-compile') {
  // Start for debugger.
  collecticonsCompile({
    dirPath: path.resolve(__dirname, '../../tests/fixtures/icons')
  });
}
