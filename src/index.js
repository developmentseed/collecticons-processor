const collecticonsCompile = require('./core/compile');

collecticonsCompile({
  dirPath: './icons'
});
module.exports = {
  compile: require('./core/compile')
};
