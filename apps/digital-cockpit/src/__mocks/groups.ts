import { Group } from '@cognite/sdk';

export const devUserGroups: Group[] = [
  {
    id: 123456789,
    name: 'dc-team-developers',
    sourceId: 'dc-team-developers-abcdf',
    capabilities: [],
  },
  {
    id: 222,
    name: 'any-other-user-group',
    sourceId: 'any-other-user-group-abcdf',
    capabilities: [],
  },
  {
    id: 333,
    name: 'not-linked-to-external-group',
    capabilities: [],
  },
] as unknown as Group[];

export const managerUserGroups: Group[] = [
  {
    id: 111111111,
    name: 'dc-team-management',
    sourceId: 'dc-team-management-abcdf',
    capabilities: [],
  },
  {
    id: 222,
    name: 'any-other-user-group',
    sourceId: 'any-other-user-group-abcdf',
    capabilities: [],
  },
] as unknown as Group[];

export const adminUserGroups: Group[] = [
  {
    id: 77777777,
    name: 'dc-system-admin',
    sourceId: 'dc-system-admin-abcdf',
    capabilities: [],
  },
  {
    id: 111111111,
    name: 'dc-team-management',
    sourceId: 'dc-team-management-abcdf',
    capabilities: [],
  },
] as unknown as Group[];

export const allUserGroups: Group[] = [
  {
    id: 77777777,
    name: 'dc-system-admin',
    sourceId: 'dc-system-admin-abcdf',
    capabilities: [],
  },
  {
    id: 123456789,
    name: 'dc-team-developers',
    sourceId: 'dc-team-developers-abcdf',
    capabilities: [],
  },
  {
    id: 111111111,
    name: 'dc-team-management',
    sourceId: 'dc-team-management-abcdf',
    capabilities: [],
  },
  {
    id: 222,
    name: 'any-other-user-group',
    sourceId: 'any-other-user-group-abcdf',
    capabilities: [],
  },
  {
    id: 333,
    name: 'not-linked-to-external-group',
    capabilities: [],
  },
] as unknown as Group[];

export const emptyUserGroups: Group[] = [] as Group[];

export const mockGroupStateAdmin = {
  loading: false,
  loaded: false,
  error: '',
  isAdmin: true,
  filter: [],
  groups: adminUserGroups,
};
