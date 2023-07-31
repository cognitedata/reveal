import { screen, fireEvent } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { AssetLabel, Props } from '../AssetLabel';

describe('AssetLabel', () => {
  const testInit = (viewProps?: Props) =>
    testRendererModal(AssetLabel, undefined, viewProps);

  it('should render asset label when `value` is greater than 0', () => {
    testInit({ type: 'Document', value: 2, titleType: 'Document' });

    expect(screen.getByTestId('asset-label')).toBeInTheDocument();
  });

  it('should not render asset label when `value` is 0', () => {
    testInit({ type: 'Document', value: 0, titleType: 'Document' });

    expect(screen.queryByTestId('asset-label')).not.toBeInTheDocument();
  });

  it('should render expected value when `value` is greater than 0 and 1', async () => {
    await testInit({ type: 'Document', value: 2, titleType: 'Document' });
    fireEvent.mouseEnter(screen.getByTestId('asset-label'), { bubbles: true });
    expect(await screen.findByText('2 Documents')).toBeInTheDocument();
  });

  it('should render expected value when `value` is equal to 1', async () => {
    await testInit({ type: 'Document', value: 1, titleType: 'Document' });
    fireEvent.mouseEnter(screen.getByTestId('asset-label'), { bubbles: true });
    expect(await screen.findByText('1 Document')).toBeInTheDocument();
  });
});
