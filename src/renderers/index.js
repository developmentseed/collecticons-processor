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

async function renderCatalog (opts = {}) {
  if (!opts.fontName) throw new ReferenceError('fontName is undefined');
  if (!opts.className) throw new ReferenceError('className is undefined');
  if (!opts.icons || !opts.icons.length) throw new ReferenceError('icons is undefined or empty');
  return JSON.stringify({
    name: opts.fontName,
    className: opts.className,
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
