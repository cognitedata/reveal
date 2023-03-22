import '@testing-library/jest-dom/extend-expect';

import { screen } from '@testing-library/react';
import { renderComponent } from '../../../__test-utils';

import { ApplyButton, ApplyButtonProps } from '../ApplyButton';

describe('NestedFilter/ApplyButton', () => {
  const defaultProps: ApplyButtonProps = {
    onClick: jest.fn(),
  };

  const testInit = (extraProps: Partial<ApplyButtonProps> = {}) => {
    return renderComponent(ApplyButton, { ...defaultProps, ...extraProps });
  };

  it('should render apply button', () => {
    testInit();
    expect(screen.getByTestId('apply-button')).toBeTruthy();
  });
});
