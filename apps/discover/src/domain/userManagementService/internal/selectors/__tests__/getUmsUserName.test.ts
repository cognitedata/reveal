import { UNKNOWN } from 'domain/userManagementService/constants';
import { getMockUmsUsers } from 'domain/userManagementService/service/__fixtures/getMockUmsUsers';

import { getUmsUserName } from '../getUmsUserName';

describe('getUmsUserName', () => {
  const umsUser = getMockUmsUsers()[0];
  const umsUserWithNoName = getMockUmsUsers()[2];
  const umsUserWithNoNameAndEmail = getMockUmsUsers()[3];

  it('should return expected result', () => {
    expect(getUmsUserName(umsUser)).toEqual(umsUser.displayName);
  });

  it('should return expected result with input', () => {
    expect(getUmsUserName(umsUser, umsUser.id)).toEqual(
      `${umsUser.displayName} (you)`
    );
  });

  it('should return email of user when name is empty', () => {
    expect(getUmsUserName(umsUserWithNoName, umsUser.id)).toEqual(
      umsUserWithNoName.email
    );
  });

  it('should return `Unknonw` when name and email not defined', () => {
    expect(getUmsUserName(umsUserWithNoNameAndEmail, umsUser.id)).toEqual(
      UNKNOWN
    );
  });
});
