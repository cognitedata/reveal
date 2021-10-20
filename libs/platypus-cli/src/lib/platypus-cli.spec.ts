import { platypusCli } from './platypus-cli';

describe('platypusCli', () => {
  it('should work', () => {
    expect(platypusCli()).toEqual('platypus-cli');
  });
});
