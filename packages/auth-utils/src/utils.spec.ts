import { getFlow, saveFlow, getFlowKey } from './utils';

describe('utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Make sure getFlowKey works', () => {
    expect(getFlowKey()).toEqual('flow');
    expect(getFlowKey('one')).toEqual('flow_one');
    expect(getFlowKey('one', 'two')).toEqual('flow_one_env_two');
  });

  it('Make sure saveFlow/getFlow works', () => {
    const { flow } = getFlow();
    expect(flow).toBe(undefined);
    saveFlow('ADFS');
    const { flow: secondTime } = getFlow();
    expect(secondTime).toBe('ADFS');
  });
});
