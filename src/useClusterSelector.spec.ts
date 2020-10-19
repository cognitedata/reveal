import { getNewDomain } from './useClusterSelector';

describe('useClusterSelector', () => {
  it('Should validate foo.cogniteapp.com', () => {
    expect(getNewDomain('foo.cogniteapp.com', 'cluster1')).toBe(
      'foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate preview.foo.cogniteapp.com', () => {
    expect(getNewDomain('preview.foo.cogniteapp.com', 'cluster1')).toBe(
      'preview.foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate foo.cluster.cogniteapp.com', () => {
    expect(getNewDomain('foo.cluster.cogniteapp.com', 'cluster1')).toBe(
      'foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate preview.foo.cluster.cogniteapp.com', () => {
    expect(getNewDomain('preview.foo.cluster.cogniteapp.com', 'cluster1')).toBe(
      'preview.foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate 1234.pr.foo.cogniteapp.com', () => {
    expect(getNewDomain('1234.pr.foo.cogniteapp.com', 'cluster1')).toBe(
      '1234.pr.foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate 1234.pr.foo.cluster.cogniteapp.com', () => {
    expect(getNewDomain('1234.pr.foo.cluster.cogniteapp.com', 'cluster1')).toBe(
      '1234.pr.foo.cluster1.cogniteapp.com'
    );
  });
});
