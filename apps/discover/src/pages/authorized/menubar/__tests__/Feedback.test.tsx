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

  const intercomHelpShow = jest.fn();

  const defaultTestInit = async () => {
    const store: Store = getMockedStore();
    return testRendererModal(Feedback, store, {});
  };

  it('should render contact menu items when click `Help` button', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('should call `intercomHelper.show` only once when click `Help` option', async () => {
    (intercomHelper.show as jest.Mock).mockImplementation(() =>
      intercomHelpShow()
    );
    await defaultTestInit();

    expect(intercomHelpShow).toHaveBeenCalledTimes(0);
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));

    fireEvent.click(screen.getByText('Help'));
    expect(intercomHelpShow).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
  });

  it('should minimize the menu items drop-down when click an option', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.queryByText('Send')).not.toBeInTheDocument();

    expect(screen.getByText('Feedback')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Feedback'));

    expect(screen.getByText('Send')).toBeInTheDocument();
  });
});
