#! /usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var collecticons = require('../src/index');

function list (val) {
  return val.split(',');
}

// /////////////////////////////////////////////////////////////////////////////
//                              SCRIPT SETUP                                 ///
// /////////////////////////////////////////////////////////////////////////////
program
  .version(pkg.version);

program
  .command('compile <source-folder>')
  .description('Compile the font from svg icons')
  .option('--font-name <name>', 'name of the font', 'collecticons')
  .option('--font-types <dest>', 'font types to output (ttf,woff,eot) [ttf,woff,eot]', list, ['ttf', 'woff', 'eot'])
  .option('--font-dest <dest>', 'destination folder for the font', 'collecticons/font/')
  .option('--font-embed', 'embed the font in the css (except eot). When embedding, the font files are removed')

  .option('--author-name <dest>', 'name of the author')
  .option('--author-url <dest>', 'url of the author')

  .option('--class-name <name>', 'class name to use', 'collecticon')
  .option('--style-format <dest>', 'style formats to output (sass,css) [sass]', list, ['sass'])
  .option('--style-dest <dest>', 'destination folder for the style files', 'collecticons/styles/')
  .option('--style-name <name>', 'name for for the style file', 'icons')
  .option('--no-placeholder', 'disable the sass placeholder')
  .option('--no-standalone', 'disable the css standalone classes')

  .option('--preview-dest <dest>', 'destination folder for the preview', 'collecticons/')
  .option('--no-preview', 'disable the preview')

  .option('--catalog-dest <dest>', 'destination folder for the catalog. Output disable by default')
  .action(collecticons.process);

program
  .command('grid <source-folder> <destination-folder>')
  .description('Alter the icons grid')
  .option('-r, --remove', 'remove grid from icons')
  .action(collecticons.grid);

program
  .command('bundle <source-folder> <destination-file>')
  .description('Compile the font outputting a zip file.')
  .action(collecticons.bundle);

// Go!
program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
