import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { BlankModal } from '../BlankModal';
import { Props } from '../Modal';

describe('Modal Tests', () => {
  const testInit = async (viewProps?: Props) =>
    testRendererModal(BlankModal, undefined, viewProps);
  it('should render modal content as expected but no footer', async () => {
    await testInit({
      children: <h1>TEST</h1>,
      visible: true,
    });
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});
