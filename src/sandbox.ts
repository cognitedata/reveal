import sinon from 'sinon';

export const sandbox = sinon.createSandbox();

afterEach(() => {
  sandbox.restore();
});
