import { showBadge } from 'src/modules/Common/Components/AnnotationsBadge/utils';

describe('showBadge', () => {
  it('should be true if status is set or count is nonzero', () => {
    expect(
      showBadge(1, {
        status: 'Running',
        statusTime: 1,
      })
    ).toStrictEqual(true);
  });

  it('should be true for if status set is set, even if count is zero', () => {
    expect(
      showBadge(0, {
        status: 'Running',
        statusTime: 1,
      })
    ).toStrictEqual(true);
  });

  it('should be true for if status set is set, even if count is undefined', () => {
    expect(
      showBadge(undefined, {
        status: 'Running',
        statusTime: 1,
      })
    ).toStrictEqual(true);
  });

  it('should be true for nonzero number, even if status is undefined', () => {
    expect(showBadge(1, undefined)).toStrictEqual(true);
  });

  it('should be false for 0 and status not set', () => {
    expect(showBadge(0, undefined)).toStrictEqual(false);
  });

  it('should be false for undefined count and status not set', () => {
    expect(showBadge(undefined, undefined)).toStrictEqual(false);
  });
});
