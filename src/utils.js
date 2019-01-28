const fs = require('fs-extra');
const path = require('path');

/**
 * Simple logger with levels.
 * 1 - fatal
 * 2 - error
 * 3 - warn
 * 4 - info
 * 5 - debug
 *
 * Logger level set globally with setLevel().
 * Logging done using logger.<level>().
 */
function Logger () {
  const levels = [
    'fatal', // 1
    'error', // 2
    'warn', // 3
    'info', // 4
    'debug' // 5
  ];
  let verbosity = 3;

  levels.forEach((level, idx) => {
    this[level] = (...params) => {
      if (idx + 1 <= verbosity) console.log(...params); // eslint-disable-line
    };
  });

  this.setLevel = (_) => {
    verbosity = _;
  };

  return this;
}

/**
 * Creates a User Error object.
 * Each error has a details array where each entry is a message line to
 * be printed.
 * The error is supposed to bubble up the chain and print the cli help if
 * the option is enabled.
 * The `userError` property can be used to know if the error is created
 * on purpose rather than thrown by something else.
 *
 * @param {array} details The message lines
 *
 * @returns Error
 */
function userError (details = [], code) {
  const err = new Error('User error');
  err.userError = true;
  err.code = code;
  err.details = details;
  return err;
}

let timers = {};

/**
 * Like console.time but better. Instead of printing the value returns it.
 * Displays 1h 10m 10s notation for times above 60 seconds.
 * Uses a global timers variable to keep track of timers.
 * On the first call sets the time, on the second returns the value
 *
 * @param {string} name Timer name
 */
function time (name) {
  const t = timers[name];
  if (t) {
    let elapsed = Date.now() - t;
    if (elapsed < 1000) return `${elapsed}ms`;
    if (elapsed < 60 * 1000) return `${elapsed / 1000}s`;

    elapsed /= 1000;
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = Math.floor((elapsed % 3600) % 60);

    delete timers[name];

    return `${h}h ${m}m ${s}s`;
  } else {
    timers[name] = Date.now();
  }
}

/**
 * Validates that the given path is a directory, throwing user erros
 * in other cases.
 *
 * @param {string} dirPath Path to validate
 *
 * @see userError()
 * @throws Error if validation fails
 */
async function validateDirPath (dirPath) {
  try {
    const stats = await fs.lstat(dirPath);
    if (!stats.isDirectory()) {
      throw userError([
        'Source path must be a directory',
        ''
      ]);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw userError([
        'No files or directories found at ' + dirPath,
        ''
      ]);
    }

    throw error;
  }
}

/**
 * Same functionality as validateDirPath but with error messages directed at a
 * CLI tool.
 * Validates that the given path is a directory, throwing user erros
 * in other cases.
 *
 * @param {string} dirPath Path to validate
 *
 * @see validateDirPath()
 * @throws Error if validation fails
 */
async function validateDirPathForCLI (dirPath) {
  try {
    await validateDirPath(dirPath);
  } catch (error) {
    if (!error.userError) throw error;
    if (error.details[0].startsWith('Source path must be a directory')) {
      const args = process.argv.reduce((acc, o, idx) => {
        // Discard the first 2 arguments.
        if (idx < 1) return acc;
        if (o === dirPath) return acc.concat(path.dirname(dirPath));
        return acc.concat(o);
      }, []);

      throw userError([
        'Source path must be a directory. Try running with the following instead:',
        '',
        `  node ${args.join(' ')}`,
        ''
      ]);
    }
    throw error;
  }
}

/**
 * Formats the date to a human readable format like:
 * January 1st, 1970
 *
 * @param {Date} date The object date to format
 */
function formatHumanDate (date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate().toString();

  let ordinal;
  if (d.endsWith('11') || d.endsWith('12') || d.endsWith('13')) {
    ordinal = 'th';
  } else if (d.endsWith('1')) {
    ordinal = 'st';
  } else if (d.endsWith('2')) {
    ordinal = 'nd';
  } else if (d.endsWith('3')) {
    ordinal = 'rd';
  } else {
    ordinal = 'th';
  }

  return `${months[m]} ${d}${ordinal}, ${y}`;
}

module.exports = {
  logger: new Logger(),
  userError,
  time,
  validateDirPath,
  validateDirPathForCLI,
  formatHumanDate
};
