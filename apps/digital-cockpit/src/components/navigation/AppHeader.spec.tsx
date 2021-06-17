import { sandbox, render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import { GroupsState } from 'store/groups/types';
import { allUserGroups } from '__mocks/groups';
import { initialState as groupsInitialStore } from 'store/groups/reducer';

import merge from 'lodash/merge';
import { createMockCdfClient } from 'utils/test/client';
import AppHeader from './AppHeader';

import { devUserGroups } from '../../__mocks/groups';

const mockClient = createMockCdfClient();

describe('AppHeader', () => {
  beforeAll(() => {
    window.fetch = sandbox.stub();
  });
  beforeEach(() => {
    sandbox
      .stub(mockClient.cogniteClient.files, 'getDownloadUrls')
      .throws({ status: 400 });
  });

  it('should render', async () => {
    const view = render(<AppHeader />, { cdfClient: mockClient });
    await waitFor(() => {
      expect(view).toBeTruthy();
    });
  });
  describe('group preview', () => {
    it('should show group preview button for admin user', async () => {
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
        filter: ['dc-team-developers'],
      });
      render(<AppHeader />, {
        state: { groups: groupsState },
        cdfClient: mockClient,
      });

      const broupPreviewBar = await screen.findByTestId(
        'user-group-preview-bar'
      );
      expect(broupPreviewBar).toBeInTheDocument();
    });

    it('should NOT show group preview button for regular users', async () => {
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: devUserGroups,
      });
      render(<AppHeader />, {
        state: { groups: groupsState },
        cdfClient: mockClient,
      });

      await waitFor(() => {
        const broupPreviewBar = screen.queryByTestId('user-group-preview-bar');
        expect(broupPreviewBar).not.toBeInTheDocument();
      });
    });

    it('should show group preview bar when select group to preview', async () => {
      const selectedGroupName = 'dc-team-developers';
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
      });
      render(<AppHeader />, {
        state: { groups: groupsState },
        cdfClient: mockClient,
      });

      const previewIcon = await screen.findByTestId(
        'select-group-preview-menu'
      );
      previewIcon.click();
      const groupMenuItem = await screen.findByTestId(
        `menu-item-${selectedGroupName}`
      );
      groupMenuItem.click();
      const groupPreviewBar = await screen.findByTestId(
        'user-group-preview-bar'
      );
      expect(groupPreviewBar).toBeInTheDocument();
    });

    it('should hide group preview bar when click on "Clear view" btn', async () => {
      const selectedGroupName = 'dc-team-developers';
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
        filter: [selectedGroupName],
      });
      render(<AppHeader />, {
        state: { groups: groupsState },
        cdfClient: mockClient,
      });

      const clearViewBtn = await screen.findByText('Clear view');
      clearViewBtn.click();

      const groupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(groupPreviewBar).not.toBeInTheDocument();
    });
  });
});
