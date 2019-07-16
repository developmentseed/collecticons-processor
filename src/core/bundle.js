const fs = require('fs-extra');
const path = require('path');
const JSZip = require('node-zip');

const {
  validateDirPath
} = require('../utils');
const collecticonsCompile = require('./compile');

/**
 * Compiles the collecticons font and zips it.
 * Contains all the used icons, the fonts, stylesheet and preview.
 *
 * @param {object} params
 * @param {string} params.dirPath Source path for the svg icons.
 * @param {string} params.destFile Destination of the zip file.
 */
async function collecticonsBundle (params) {
  const {
    dirPath,
    destFile
  } = params;

  await validateDirPath(dirPath);

  const resultFiles = await collecticonsCompile({
    dirPath,
    styleFormats: ['css'],
    styleDest: './styles',
    fontDest: './',
    fontTypes: ['woff', 'woff2'],
    previewDest: './',
    noFileOutput: true,
    rescale: true
  });

  if (resultFiles === null) return;

  // Create zip.
  let zip = new JSZip();

  // Add generated files.
  resultFiles.forEach(file => {
    zip.file(file.path, file.contents);
  });

  // Add the icons.
  const dir = await fs.readdir(dirPath);
  const svgs = await Promise.all(dir.map(async file => {
    return file.endsWith('.svg')
      ? (
        {
          path: `icons/${file}`,
          contents: await fs.readFile(path.resolve(dirPath, file))
        }
      )
      : null;
  }));

  svgs.forEach(file => {
    zip.file(file.path, file.contents);
  });

  await fs.ensureDir(path.dirname(destFile));
  await fs.writeFile(destFile, zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
}

module.exports = collecticonsBundle;

if (process.env.NODE_ENV === 'debug-bundle') {
  // Start for debugger.
  collecticonsBundle({
    dirPath: path.resolve(__dirname, '../../tests/fixtures/icons'),
    destFile: path.resolve(__dirname, '../../collecticons.zip')
  });
}
