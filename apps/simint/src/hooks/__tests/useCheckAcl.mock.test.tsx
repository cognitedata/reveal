import { useCapabilities } from '@simint-app/hooks/useCapabilities';
import type { AclName } from '@simint-app/hooks/useCheckAcl';
import { useCheckAcl } from '@simint-app/hooks/useCheckAcl';
import { renderHook } from '@testing-library/react';

jest.mock('@simint-app/hooks/useCapabilities', () => ({
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

    // TODO - POFSP-82
    expect(result.current.hasAllCapabilities).toBe(true);
  });
});
