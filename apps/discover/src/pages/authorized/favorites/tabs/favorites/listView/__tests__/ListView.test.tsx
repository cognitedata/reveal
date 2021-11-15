import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';
import { ViewMode } from 'modules/favorite/constants';

import ListView, { Props } from '../ListView';

describe('Favorite List View', () => {
  const defaultTestInit = (viewProps?: Props) =>
    testRendererModal(ListView, undefined, viewProps);

  it('should render the table', async () => {
    await defaultTestInit({
      sets: [
        {
          createdTime: '',
          assetCount: 1,
          content: { documentIds: [], wells: {}, seismicIds: [] },
          id: '12',
          name: 'test',
          description: 'test-desc',
          lastUpdatedBy: [],
          lastUpdatedTime: '',
          owner: { id: 'test' },
          sharedWith: [],
        },
      ],
      handleNavigateFavoriteSet: jest.fn(),
      handleOpenModal: jest.fn(),
      isOwner: jest.fn(),
      setCommentTarget: jest.fn(),
      viewMode: ViewMode.Row,
    });

    const table = screen.queryByTestId('list-favourite');

    expect(table).toBeInTheDocument();
  });
});
