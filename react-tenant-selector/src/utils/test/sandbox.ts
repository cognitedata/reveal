import * as sinon from 'sinon';
import addons, { mockChannel } from '@storybook/addons';

/**
 * Stub out the storybook addon channels. See here for more information:
 * https://storybook.js.org/docs/basics/faq/#why-is-there-no-addons-channel
 */
beforeEach(() => {
  addons.setChannel(mockChannel());
});

/**
 * Sinon Sandbox
 * http://sinonjs.org/docs/#sinon-sandbox
 *
 * A sandbox to house spy(), stub(), mock(), etc. that is automatically reset after each test.
 */
const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore();
});

export default sandbox;
