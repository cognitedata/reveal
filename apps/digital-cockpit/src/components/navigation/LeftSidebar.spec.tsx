// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react';
import render from 'utils/test/renderStory';
import { clickElement } from 'utils/test/events';
import { Base } from './LeftSidebar.stories';
import * as leftSidebarUtils from './utils';

jest.mock('./utils', () => ({
  handleHideSidebar: jest.fn(),
}));

describe('LeftSidebar', () => {
  it('should render  correctly', async () => {
    const { expectByText } = render(<Base />);
    expectByText('Applications');
    expectByText('Maintenance Planner');
    expectByText('Suites');
    expectByText('Operations');
    expectByText('Operations');
    expectByText('Asset Performance & Integrity');
  });
  it('should hide sidebar when collapse button is clicked', async () => {
    const { getByRole } = render(<Base />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const collapseButton = getByRole('button');
    const handleHideSidebar = jest.spyOn(leftSidebarUtils, 'handleHideSidebar');
    clickElement(collapseButton as HTMLDivElement);
    setTimeout(() => {
      expect(handleHideSidebar).toHaveBeenCalled();
    }, 500);
  });
});
