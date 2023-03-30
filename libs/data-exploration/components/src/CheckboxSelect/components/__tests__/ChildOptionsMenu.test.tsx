import '@testing-library/jest-dom/extend-expect';

import { screen, fireEvent } from '@testing-library/react';

import { ChildOptionsMenu, ChildOptionsMenuProps } from '../ChildOptionsMenu';
import { renderComponent } from '../../../__test-utils';
import { OptionSelection } from '../../types';

jest.mock('@cognite/unified-file-viewer', () => jest.fn());

describe('NestedFilter/ChildOptionsMenu', () => {
  const onChange = jest.fn();

  const defaultProps: ChildOptionsMenuProps = {
    parentOptionValue: 'parent',
    options: [{ value: 'option1' }, { value: 'option2' }, { value: 'option3' }],
    selection: {},
    onChange,
  };

  const testInit = (extraProps: Partial<ChildOptionsMenuProps> = {}) => {
    return renderComponent(ChildOptionsMenu, {
      ...defaultProps,
      ...extraProps,
    });
  };

  const clickOption = (name: string) => {
    fireEvent.click(screen.getByText(name));
  };

  const validateSelection = (expectedSelection: OptionSelection) => {
    expect(onChange).toHaveBeenCalledWith(expectedSelection);
  };

  it('should not render options', () => {
    testInit({ options: undefined });
    expect(screen.queryByTestId('option')).toBeFalsy();

    testInit({ options: [] });
    expect(screen.queryByTestId('option')).toBeFalsy();
  });

  it('should render correct number of options', () => {
    testInit();
    expect(screen.getAllByTestId('option')).toHaveLength(3);
  });

  it('should add option1 to the selection', () => {
    testInit({ selection: {} });
    clickOption('option1');
    validateSelection({ parent: ['option1'] });
  });

  it('should add option1 and option2 to the selection', () => {
    testInit({ selection: { parent: ['option1'] } });
    clickOption('option2');
    validateSelection({ parent: ['option1', 'option2'] });
  });

  it('should call with an empty array for the children selection', () => {
    testInit({ selection: { parent: ['option1', 'option2'] } });
    clickOption('option3');
    validateSelection({ parent: [] });
  });

  it('should remove option3 from the selection', () => {
    testInit({ selection: { parent: [] } });
    clickOption('option3');
    validateSelection({ parent: ['option1', 'option2'] });
  });

  it('should remove option2 from the selection', () => {
    testInit({ selection: { parent: ['option1', 'option2'] } });
    clickOption('option2');
    validateSelection({ parent: ['option1'] });
  });

  it('should remove parent from the selection', () => {
    testInit({ selection: { parent: ['option1'] } });
    clickOption('option1');
    validateSelection({});
  });
});
