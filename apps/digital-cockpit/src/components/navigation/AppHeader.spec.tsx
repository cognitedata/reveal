import userEvent from '@testing-library/user-event';
import { sandbox, render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import { GroupsState } from 'store/groups/types';
import { allUserGroups } from '__mocks/groups';
import { initialState as groupsInitialStore } from 'store/groups/reducer';
import merge from 'lodash/merge';
import { createMockCdfClient } from 'utils/test/client';

import { devUserGroups } from '../../__mocks/groups';

import AppHeader from './AppHeader';

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
    const view = await render(<AppHeader />);
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
      await render(<AppHeader />, {
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
      await render(<AppHeader />, {
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
      await render(<AppHeader />, {
        state: { groups: groupsState },
        cdfClient: mockClient,
      });

      const clearViewBtn = await screen.findByText('Clear view');
      await userEvent.click(clearViewBtn);

      const groupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(groupPreviewBar).not.toBeInTheDocument();
    });
  });
});
