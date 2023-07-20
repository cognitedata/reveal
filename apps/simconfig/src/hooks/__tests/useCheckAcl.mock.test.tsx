import { renderHook } from '@testing-library/react-hooks';

import { useCapabilities } from 'hooks/useCapabilities';
import type { AclName } from 'hooks/useCheckAcl';
import { useCheckAcl } from 'hooks/useCheckAcl';

jest.mock('hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

describe('useCheckAcl', () => {
  beforeEach(() => {
    (useCapabilities as jest.Mock).mockReturnValue({
      data: [
        { groupsAcl: { actions: ['action1', 'action2'] } },
        { assetsAcl: { actions: ['action3'] } },
      ],
      isFetched: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the capability map and hasAllCapabilities flag', () => {
    const requiredCapabilities = [
      { acl: 'groupsAcl' as AclName, actions: ['action1', 'action2'] },
      { acl: 'assetsAcl' as AclName, actions: ['action3'] },
    ];

    const { result } = renderHook(() => useCheckAcl(requiredCapabilities));

    expect(result.current.capabilityMap).toEqual({
      groupsAcl: true,
      assetsAcl: true,
    });

    expect(result.current.hasAllCapabilities).toBe(true);
  });

  it('should handle missing capabilities', () => {
    (useCapabilities as jest.Mock).mockReturnValue({
      data: [
        { groupsAcl: { actions: ['action1', 'action2'] } },
        { assetsAcl: { actions: ['action4'] } },
      ],
      isFetched: true,
    });

    const requiredCapabilities = [
      { acl: 'groupsAcl' as AclName, actions: ['action1', 'action2'] },
      { acl: 'assetsAcl' as AclName, actions: ['action3'] },
    ];

    const { result } = renderHook(() => useCheckAcl(requiredCapabilities));

    expect(result.current.capabilityMap).toEqual({
      groupsAcl: true,
      assetsAcl: false,
    });

    expect(result.current.hasAllCapabilities).toBe(false);
  });
});
