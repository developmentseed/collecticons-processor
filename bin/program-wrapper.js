const { logger, userError, validateDirPathForCLI } = require('../src/utils');
const programCompile = require('../src/programs/compile');

module.exports.compileWrapper = async (dirPath, command) => {
  await validateDirPathForCLI(dirPath);
  const {
    sassPlaceholder,
    cssClass,
    fontTypes,
    styleFormat
  } = command;

  try {
    return programCompile({
      dirPath
    });
  } catch (error) {
    if (!error.userError) throw error;
    // Capture some errors and convert to their command line alternative.
    const code = error.code;
    if (code === 'PLC_CLASS_EXC') {
      error.details = ['Error: --no-sass-placeholder and --no-css-class are mutually exclusive'];
    } else if (code === 'FONT_TYPE') {
      error.details = ['Error: invalid font type value passed to --font-types'];
    } else if (code === 'STYLE_TYPE') {
      error.details = ['Error: invalid style format value passed to --style-format'];
    }

    throw error;
  }
};
