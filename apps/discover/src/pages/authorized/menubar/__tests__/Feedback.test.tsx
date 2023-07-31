import { fireEvent, screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Feedback, ZENDESK_ENDPOINT } from '../Feedback';

describe('Feedback', () => {
  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  const defaultTestInit = async () => {
    const store: Store = getMockedStore();
    return testRendererModal(Feedback, store, {});
  };

  it('should render contact menu items when click `Support` button', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('should redirect to zendesk page when click `Support` option', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByRole('button', { name: 'Help' }));

    const link = screen.getByRole('link', { name: 'Support' });
    expect(link).toHaveAttribute('href', ZENDESK_ENDPOINT);
    expect(link).toHaveAttribute('target', '_blank');
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
