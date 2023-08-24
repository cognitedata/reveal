import { SerializedCanvasDocument } from '../../../lib/types';
import { UserProfile } from '../../UserProfileProvider';

export const profilesMe: UserProfile = {
  displayName: 'Mustafa Sarac',
  email: 'mustafa.sarac@cognitedata.com',
  lastUpdatedTime: 1682420852021,
  userIdentifier: '7Jk1xtg0qqr0-LJkatoGOQ',
};

export const profilesSearch: UserProfile[] = [
  {
    displayName: 'Mustafa Sarac',
    email: 'mustafa.sarac@cognitedata.com',
    lastUpdatedTime: 1682420852021,
    userIdentifier: '7Jk1xtg0qqr0-LJkatoGOQ',
  },
  {
    displayName: 'John Doe',
    email: 'john.doe@cognitedata.com',
    lastUpdatedTime: 3682420852021,
    userIdentifier: '3Jk1xtg0qqr0-LJkatoGOQ',
  },
  {
    displayName: 'Bob Foo',
    email: 'bob.foo@cognitedata.com',
    lastUpdatedTime: 2682420852021,
    userIdentifier: '2Jk1xtg0qqr0-LJkatoGOQ',
  },
];

export const selectedUsers: UserProfile[] = [
  {
    displayName: 'John Doe',
    email: 'john.doe@cognitedata.com',
    lastUpdatedTime: 3682420852021,
    userIdentifier: '3Jk1xtg0qqr0-LJkatoGOQ',
  },
  {
    displayName: 'Bob Foo',
    email: 'bob.foo@cognitedata.com',
    lastUpdatedTime: 2682420852021,
    userIdentifier: '2Jk1xtg0qqr0-LJkatoGOQ',
  },
];

export const canvas: SerializedCanvasDocument = {
  createdBy: '7Jk1xtg0qqr0-LJkatoGOQ',
  createdTime: '2023-06-16T14:54:42.832Z',
  data: {
    canvasAnnotations: [],
    containerReferences: [],
    fdmInstanceContainerReferences: [],
    context: [],
  },
  externalId: '7a9539e3-785a-4999-9d4b-bbf8e99e45e2',
  name: "Mustafa's public canvas",
  updatedAt: '2023-08-03T15:08:02.502+00:00',
  updatedBy: '7Jk1xtg0qqr0-LJkatoGOQ',
  visibility: 'public',
};
