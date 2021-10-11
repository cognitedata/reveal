import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { WellPreviewAction } from '../WellPreviewAction';

describe('Wellbore preview actions', () => {
  const page = (viewStore: Store, viewProps?: any) =>
    testRenderer(WellPreviewAction, viewStore, viewProps);

  const defaultTestInit = async () => {
    const store = getMockedStore();
    return { ...page(store), store };
  };

  it('should have preview buttons', async () => {
    await defaultTestInit();

    const viewBtn = await screen.findByText('View');
    expect(viewBtn).toBeInTheDocument();

    const feedbackBtn = await screen.findByTestId('well-button-feedback');
    expect(feedbackBtn).toBeInTheDocument();
  });
});
