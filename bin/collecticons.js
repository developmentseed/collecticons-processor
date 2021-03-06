#! /usr/bin/env node
const program = require('commander');

const pkg = require('../package.json');
const { logger } = require('../src/utils');

const { compileProgram, bundleProgram } = require('./programs');

const list = val => val.split(',');

const actionHandler = fn => async (...args) => {
  const command = args[args.length - 1];
  const { quiet, verbose } = command.parent;
  logger.setLevel(quiet ? 0 : verbose || 1);
  logger.info(pkg.name, pkg.version);

  try {
    await fn(...args);
    process.exit(0);
  } catch (error) {
    if (error.userError) {
      error.details.forEach(row => logger.fatal(row));
    } else {
      logger.fatal(error);
    }
    process.exit(1);
  }
};

// /////////////////////////////////////////////////////////////////////////////
//                              SCRIPT SETUP                                 ///
// /////////////////////////////////////////////////////////////////////////////
program
  .option('-v, --verbose', 'increase verbosity', (v, t) => t + 1, 1)
  .option('--quiet', 'disable all output')
  .version(pkg.version);

program
  .command('compile <source-folder>')
  .description('Compile the font from svg icons')
  .option('--font-name <name>', 'name of the font', 'collecticons')
  .option('--font-types <val>', 'font types to output (woff,woff2)', list, ['woff2'])

  .option('--font-dest <val>', 'outputs font files to given destination. Output disabled by default. Using this disables font embed')

  .option('--author-name <val>', 'name of the author')
  .option('--author-url <val>', 'url of the author')

  .option('--class-name <name>', 'class name to use', 'collecticon')
  .option('--style-name <name>', 'name for for the style file', 'icons')
  .option('--style-formats <val>', 'style formats to output (sass,css)', list, ['sass'])
  .option('--style-dest <val>', 'destination folder for the style files', 'collecticons/styles/')

  .option('--no-sass-placeholder', 'disable the sass placeholder')
  .option('--no-css-class', 'disable the css standalone classes')

  .option('--preview-dest <dest>', 'destination folder for the preview', 'collecticons/')
  .option('--no-preview', 'disable the preview')

  .option('--catalog-dest <dest>', 'destination folder for the catalog. Output disable by default')
  .option('--rescale', 'normalize icons by scaling them to the height of the highest icon')

  .option('--experimental-font-on-catalog', 'includes the base64 string of the fonts on the catalog. Experimental feature, may change at anytime')
  .option('--experimental-disable-styles', 'disabled the style output. Experimental feature, may change at anytime')
  .action(actionHandler(compileProgram));

program
  .command('bundle <source-folder> <destination-file>')
  .description('Compile the font outputting a zip file. Contains all the used icons, stylesheet and preview.')
  .action(actionHandler(bundleProgram));

// Go!
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
