import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { Modal, Props } from '../Modal';

describe('Modal Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(Modal, undefined, viewProps);
  it('should render modal content as expected', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
    });
    expect(screen.getByText('TEST')).toBeInTheDocument();
  });
});
