import '@testing-library/jest-dom/extend-expect';

import { renderComponent } from '@data-exploration-components/__test-utils/renderer';

import { screen } from '@testing-library/react';

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
