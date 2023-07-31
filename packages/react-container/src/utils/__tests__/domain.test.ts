import { getNewDomain } from '../domain';

describe('getNewDomain', () => {
  it('Should validate localhost and default port', () => {
    expect(getNewDomain('localhost', 'cluster1')).toBe('localhost:3000');
  });
  it('Should validate ew1 cluster', () => {
    expect(getNewDomain('foo.cogniteapp.com', '')).toBe('foo.cogniteapp.com');
  });
  it('Should validate foo.cogniteapp.com', () => {
    expect(getNewDomain('foo.cogniteapp.com', 'cluster1')).toBe(
      'foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate foo.cluster.cogniteapp.com', () => {
    expect(getNewDomain('foo.cluster.cogniteapp.com', 'cluster1')).toBe(
      'foo.cluster1.cogniteapp.com'
    );
  });
  it('Should validate ew1 cluster on preview', () => {
    expect(getNewDomain('foo.preview.cogniteapp.com', '')).toBe(
      'foo.preview.cogniteapp.com'
    );
  });
  it('Should validate foo.preview.cogniteapp.com', () => {
    expect(getNewDomain('foo.preview.cogniteapp.com', 'cluster1')).toBe(
      'foo.preview.cluster1.cogniteapp.com'
    );
  });
  it('Should validate ew1 cluster on staging', () => {
    expect(getNewDomain('foo.staging.cogniteapp.com', '')).toBe(
      'foo.staging.cogniteapp.com'
    );
  });
  it('Should validate foo.staging.cogniteapp.com', () => {
    expect(getNewDomain('foo.staging.cogniteapp.com', 'cluster1')).toBe(
      'foo.staging.cluster1.cogniteapp.com'
    );
  });
  it('Should validate 1234-foo.pr.cogniteapp.com', () => {
    expect(getNewDomain('1234-foo.pr.cogniteapp.com', 'cluster1')).toBe(
      '1234-foo.pr.cluster1.cogniteapp.com'
    );
  });
  it('Should validate foo.preview.cluster.cogniteapp.com', () => {
    expect(getNewDomain('foo.preview.cluster.cogniteapp.com', 'cluster1')).toBe(
      'foo.preview.cluster1.cogniteapp.com'
    );
  });
  it('Should validate foo.staging.cluster.cogniteapp.com', () => {
    expect(getNewDomain('foo.staging.cluster.cogniteapp.com', 'cluster1')).toBe(
      'foo.staging.cluster1.cogniteapp.com'
    );
  });
  it('Should validate 1234-foo.pr.cluster.cogniteapp.com', () => {
    expect(getNewDomain('1234-foo.pr.cluster.cogniteapp.com', 'cluster1')).toBe(
      '1234-foo.pr.cluster1.cogniteapp.com'
    );
  });
  it('Should validate pr-1234.foo.preview.cogniteapp.com', () => {
    // legacy PR previews
    // TODO(INFIELD-1930): can be removed once Infield migrated to the new format
    expect(getNewDomain('pr-1234.foo.preview.cogniteapp.com', '')).toBe(
      'pr-1234.foo.preview.cogniteapp.com'
    );
  });
});
