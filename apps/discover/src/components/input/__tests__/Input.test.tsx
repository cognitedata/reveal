import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import Input from '../Input';

describe('input', () => {
  const page = (viewProps?: any) => testRenderer(Input, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page({
        label: 'test-label',
        type: 'number',
        value: 'test-value',
        onChange: jest.fn(),
      }),
    };
  };

  it('should render title correctly', async () => {
    await defaultTestInit();

    expect(screen.getByText('test-label')).toBeInTheDocument();
  });
});
