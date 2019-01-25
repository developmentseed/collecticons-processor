const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');

async function renderCss (opts) {
  const tpl = await fs.readFile(path.resolve(__dirname, 'css.ejs'), 'utf8');
  return ejs.render(tpl, opts);
}

async function renderSass (opts = {}) {
  const tpl = await fs.readFile(path.resolve(__dirname, 'sass.ejs'), 'utf8');
  return ejs.render(tpl, opts);
}

async function renderPreview (opts) {
  
}

async function renderCatalog (opts) {
  
}

module.exports = {
  renderCss,
  renderSass,
  renderPreview,
  renderCatalog
};
