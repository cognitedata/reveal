import uniqueId from 'lodash/uniqueId';

export const testTenant = 'test';

export const getEmail = (): string => `test-${uniqueId()}-discover@cognite.com`;

export const defaultTestUser = '1:user,name@cognite,com';
export const secondTestUser = '2:user,nonadmin@cognite,com';
export const getAnotherUser = (email: string = getEmail()) =>
  `${uniqueId()}:${email.replace('.', ',')}`;
