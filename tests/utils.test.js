const { assert } = require('chai');
const path = require('path');

const { validateDirPath, validateDirPathForCLI } = require('../src/utils');

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
});
