const { assert } = require('chai');
const path = require('path');

const { validateDirPath, validateDirPathForCLI, formatHumanDate } = require('../src/utils');

describe('Utils functions', function () {
  describe('validateDirPath', function () {
    it('Throw userError when path is invalid', async function () {
      try {
        await validateDirPath('invalid-path');
      } catch (error) {
        const msgs = error.details;
        assert.isTrue(error.userError);
        assert.deepEqual(msgs, [
          'No files or directories found at invalid-path',
          ''
        ]);
        return;
      }

      // Failsafe.
      assert.fail('Error not thrown');
    });

    it('Throw userError when path is a file', async function () {
      try {
        await validateDirPath(path.join(__dirname, 'mocha.opts'));
      } catch (error) {
        assert.isTrue(error.userError);
        assert.deepEqual(error.details, [
          'Source path must be a directory',
          ''
        ]);
        return;
      }

      // Failsafe.
      assert.fail('Error not thrown');
    });

    it('Return when path is valid', async function () {
      try {
        await validateDirPath(path.join(__dirname, 'fixtures'));
      } catch (error) {
        assert.fail(error);
      }
    });
  });

  describe('validateDirPathForCLI', function () {
    it('Throw userError when path is invalid', async function () {
      try {
        await validateDirPathForCLI('invalid-path');
      } catch (error) {
        const msgs = error.details;
        assert.isTrue(error.userError);
        assert.deepEqual(msgs, [
          'No files or directories found at invalid-path',
          ''
        ]);
        return;
      }

      // Failsafe.
      assert.fail('Error not thrown');
    });

    it('Throw userError when path is a file', async function () {
      try {
        await validateDirPathForCLI(path.join(__dirname, 'mocha.opts'));
      } catch (error) {
        // Exclude the path suggestion from the messages.
        const msgs = error.details.filter((o, idx) => idx !== 2);
        assert.isTrue(error.userError);

        assert.deepEqual(msgs, [
          'Source path must be a directory. Try running with the following instead:',
          '',
          // Path suggestion would be here.
          ''
        ]);
        return;
      }

      // Failsafe.
      assert.fail('Error not thrown');
    });

    it('Return when path is valid', async function () {
      try {
        await validateDirPathForCLI(path.join(__dirname, 'fixtures'));
      } catch (error) {
        assert.fail(error);
      }
    });
  });

  describe('formatHumanDate', function () {
    it('Return formatted date', async function () {
      assert.equal(formatHumanDate(new Date('1970/01/01')), 'January 1st, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/02')), 'January 2nd, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/03')), 'January 3rd, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/11')), 'January 11th, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/12')), 'January 12th, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/13')), 'January 13th, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/20')), 'January 20th, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/21')), 'January 21st, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/22')), 'January 22nd, 1970');
      assert.equal(formatHumanDate(new Date('1970/01/23')), 'January 23rd, 1970');
    });
  });
});
