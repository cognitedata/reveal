import { fireEvent, screen } from '@testing-library/react';
import { Store } from 'redux';

import { intercomHelper } from '@cognite/intercom-helper';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Feedback } from '../Feedback';

jest.mock('@cognite/intercom-helper', () => ({
  intercomHelper: { show: jest.fn() },
}));

describe('Feedback', () => {
  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  const feedbackOnClick = jest.fn();
  const intercomHelpShow = jest.fn();

  const defaultTestInit = async () => {
    const store: Store = getMockedStore();
    return testRendererModal(Feedback, store, { feedbackOnClick });
  };

  it('should render contact menu items when click `Help` button', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByTestId('feedback-options'));
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('should call `feedbackOnClick` only once when click `Feedback` option', async () => {
    await defaultTestInit();

    expect(feedbackOnClick).toHaveBeenCalledTimes(0);
    fireEvent.click(screen.getByTestId('feedback-options'));

    fireEvent.click(screen.getByText('Feedback'));
    expect(feedbackOnClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
  });

  it('should call `intercomHelper.show` only once when click `Help` option', async () => {
    (intercomHelper.show as jest.Mock).mockImplementation(() =>
      intercomHelpShow()
    );
    await defaultTestInit();

    expect(intercomHelpShow).toHaveBeenCalledTimes(0);
    fireEvent.click(screen.getByTestId('feedback-options'));

    fireEvent.click(screen.getByText('Help'));
    expect(intercomHelpShow).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
  });

  it('should minimize the menu items drop-down when click an option', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByTestId('feedback-options'));
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Feedback'));
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
  });
});
