import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe('useOneOfPermissions', () => {
  function testPermission(perms, expected) {
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
    const permissions = useOneOfPermissions(perms);
    expect(permissions.data).toBe(expected);
  }
  test('Having either AclAction should give you access', () => {
    testPermission([{ acl: EXTRACTION_PIPELINES_ACL, action: 'READ' }], true);
  });
  test('Must even if you have other unrelated actions', () => {
    testPermission(
      [
        { acl: EXTRACTION_PIPELINES_ACL, action: 'FOOBAR' },
        { acl: EXTRACTION_PIPELINES_ACL, action: 'READ' },
      ],
      true
    );
  });
  test('Does not work if you dont have any of the required capabilities', () => {
    testPermission(
      [{ acl: EXTRACTION_PIPELINES_ACL, action: 'FOOBAR' }],
      false
    );
  });
  test('Check all groups for the required acl/action combination (and not just the first one)', () => {
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [
        { acl: EXTRACTION_PIPELINES_ACL, actions: ['READ'] },
        { acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] },
      ],
    });
    const hasAccess = useOneOfPermissions([
      { acl: EXTRACTION_PIPELINES_ACL, action: 'WRITE' },
    ]).data;
    expect(hasAccess).toBe(true);
  });
});
