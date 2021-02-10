import React from 'react';
import { sandbox, render } from 'utils/test';
import { screen } from '@testing-library/react';
import { GroupsState } from 'store/groups/types';
import { allUserGroups } from '__mocks/groups';
import { initialState as groupsInitialStore } from 'store/groups/reducer';

import merge from 'lodash/merge';
import AppHeader from './AppHeader';

import { devUserGroups } from '../../__mocks/groups';

describe('AppHeader', () => {
  beforeAll(() => {
    window.fetch = sandbox.stub();
  });

  it('should render', () => {
    const component = render(<AppHeader />);
    expect(component).toBeTruthy();
  });
  describe('group preview', () => {
    it('should show group preview button for admin user', () => {
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
        filter: ['dc-team-developers'],
      });
      render(<AppHeader />, { state: { groups: groupsState } });

      const broupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(broupPreviewBar).toBeTruthy();
    });

    it('should NOT show group preview button for regular users', () => {
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: devUserGroups,
      });
      render(<AppHeader />, { state: { groups: groupsState } });

      const broupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(broupPreviewBar).toBeFalsy();
    });

    it('should show group preview bar when select group to preview', async () => {
      const selectedGroupName = 'dc-team-developers';
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
      });
      render(<AppHeader />, { state: { groups: groupsState } });

      const previewIcon = await screen.findByTestId(
        'select-group-preview-menu'
      );
      previewIcon.click();
      const groupMenuItem = await screen.findByTestId(
        `menu-item-${selectedGroupName}`
      );
      groupMenuItem.click();
      const groupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(groupPreviewBar).toBeTruthy();
    });

    it('should hide group preview bar when click on "Clear view" btn', async () => {
      const selectedGroupName = 'dc-team-developers';
      const groupsState: GroupsState = merge({}, groupsInitialStore, {
        groups: allUserGroups,
        isAdmin: true,
        filter: [selectedGroupName],
      });
      render(<AppHeader />, { state: { groups: groupsState } });

      const clearViewBtn = screen.queryByText('Clear view');
      expect(clearViewBtn).toBeTruthy();
      clearViewBtn.click();

      const groupPreviewBar = screen.queryByTestId('user-group-preview-bar');
      expect(groupPreviewBar).toBeFalsy();
    });
  });
});
