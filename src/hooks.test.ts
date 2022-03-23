// @ts-nocheck
import { Group } from '@cognite/sdk';
import { forUnitTests } from './hooks';

describe('hooks', () => {
  describe('group update', () => {
    const { getUpdater } = forUnitTests;
    test('service account update should not be called if a group does not have any service accounts', async () => {
      const sdk = {
        projects: {
          retrieve: jest.fn().mockResolvedValue({
            name: 'test-project',
            urlName: 'test-project',
            defaultGroupId: 1,
          }),
          updateProject: jest.fn().mockResolvedValue(undefined),
        },
        groups: {
          addServiceAccounts: jest.fn().mockResolvedValue([]),
          listServiceAccounts: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue([
            {
              id: 2,
              isDeleted: false,
              deletedTime: -1,
              name: 'new-group',
            },
          ]),
          delete: jest.fn().mockResolvedValue([]),
        },
      };
      const mockProject = 'test-project';
      const update = getUpdater(sdk!, mockProject);

      const oldGroup: Group = {
        id: 1,
        name: 'test-group',
        capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        isDeleted: false,
      };
      await update(oldGroup);
      expect(sdk.groups.listServiceAccounts).toHaveBeenCalled();
      expect(sdk.groups.create).toHaveBeenCalledWith([
        {
          name: 'test-group',
          capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        },
      ]);
      expect(sdk.groups.addServiceAccounts).not.toHaveBeenCalledWith(2, [42]);
    });

    test('service account should be update when editing a group with service accounts', async () => {
      const sdk = {
        projects: {
          retrieve: jest.fn().mockResolvedValue({
            name: 'test-project',
            urlName: 'test-project',
            defaultGroupId: 1,
          }),
          updateProject: jest.fn().mockResolvedValue(undefined),
        },
        groups: {
          addServiceAccounts: jest.fn().mockResolvedValue([]),
          listServiceAccounts: jest.fn().mockResolvedValue([
            {
              name: 'vegard.okland@cognite.com',
              groups: [1],
              id: 42,
              isDeleted: false,
              deletedTime: -1,
            },
          ]),
          create: jest.fn().mockResolvedValue([
            {
              id: 2,
              isDeleted: false,
              deletedTime: -1,
              name: 'new-group',
            },
          ]),
          delete: jest.fn().mockResolvedValue([]),
        },
      };
      const mockProject = 'test-project';
      const update = getUpdater(sdk!, mockProject);

      const oldGroup: Group = {
        id: 1,
        name: 'test-group',
        capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        isDeleted: false,
      };
      await update(oldGroup);
      expect(sdk.groups.listServiceAccounts).toHaveBeenCalled();
      expect(sdk.groups.create).toHaveBeenCalledWith([
        {
          name: 'test-group',
          capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        },
      ]);
      expect(sdk.groups.addServiceAccounts).toHaveBeenCalledWith(2, [42]);
    });

    test('default groups should not be updated when updating a group that is not the default grouop', async () => {
      const sdk = {
        projects: {
          retrieve: jest.fn().mockResolvedValue({
            name: 'test-project',
            urlName: 'test-project',
            defaultGroupId: 42,
          }),
          updateProject: jest.fn().mockResolvedValue(undefined),
        },
        groups: {
          addServiceAccounts: jest.fn().mockResolvedValue([]),
          listServiceAccounts: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue([
            {
              id: 2,
              isDeleted: false,
              deletedTime: -1,
              name: 'new-group',
            },
          ]),
          delete: jest.fn().mockResolvedValue([]),
        },
      };
      const mockProject = 'test-project';
      const update = getUpdater(sdk!, mockProject);

      const oldGroup: Group = {
        id: 1,
        name: 'test-group',
        capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        isDeleted: false,
      };
      await update(oldGroup);
      expect(sdk.groups.listServiceAccounts).toHaveBeenCalled();
      expect(sdk.groups.create).toHaveBeenCalledWith([
        {
          name: 'test-group',
          capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        },
      ]);
      expect(sdk.projects.updateProject).not.toHaveBeenCalled();
    });

    test('default groups should be updated when updating a group that is not the default grouop', async () => {
      const sdk = {
        projects: {
          retrieve: jest.fn().mockResolvedValue({
            name: 'test-project',
            urlName: 'test-project',
            defaultGroupId: 1,
          }),
          updateProject: jest.fn().mockResolvedValue(undefined),
        },
        groups: {
          addServiceAccounts: jest.fn().mockResolvedValue([]),
          listServiceAccounts: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockResolvedValue([
            {
              id: 2,
              isDeleted: false,
              deletedTime: -1,
              name: 'new-group',
            },
          ]),
          delete: jest.fn().mockResolvedValue([]),
        },
      };
      const mockProject = 'test-project';
      const update = getUpdater(sdk!, mockProject);

      const oldGroup: Group = {
        id: 1, // same as default above
        name: 'test-group',
        capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        isDeleted: false,
      };
      await update(oldGroup);
      expect(sdk.groups.listServiceAccounts).toHaveBeenCalled();
      expect(sdk.groups.create).toHaveBeenCalledWith([
        {
          name: 'test-group',
          capabilities: [{ assetsAcl: { scope: { all: {} }, actions: [] } }],
        },
      ]);
      expect(sdk.projects.updateProject).toHaveBeenCalledWith('test-project', {
        update: {
          defaultGroupId: { set: 2 },
        },
      });
    });
  });
});
