import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeDefinitionItem, Props } from '../components/CodeDefinitionItem';

describe('CodeDefinitionItem', () => {
  const page = ({ code, definition, showLabels, onLegendUpdated }: Props) =>
    render(
      <CodeDefinitionItem
        code={code}
        definition={definition}
        onLegendUpdated={onLegendUpdated}
        showLabels={showLabels}
      />
    );

  it('should render initial design correctly', async () => {
    await page({ code: 'Hi', onLegendUpdated: jest.fn });

    expect(screen.getAllByRole('textbox').length).toEqual(2);
    const codeInput = screen.getByTestId('code-input');
    const definitionInput = screen.getByTestId('definition-input');

    expect(codeInput).toBeInTheDocument();
    expect(codeInput).toHaveValue('Hi');

    expect(definitionInput).toBeInTheDocument();
    expect(definitionInput).toHaveValue('');

    expect(screen.queryByText('Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Definition')).not.toBeInTheDocument();
  });

  it('should render definition value if provided', async () => {
    await page({
      code: 'Hi',
      onLegendUpdated: jest.fn,
      definition: 'Something',
    });

    expect(screen.getAllByRole('textbox').length).toEqual(2);
    const codeInput = screen.getByTestId('code-input');
    const definitionInput = screen.getByTestId('definition-input');

    expect(codeInput).toBeInTheDocument();
    expect(codeInput).toHaveValue('Hi');

    expect(definitionInput).toBeInTheDocument();
    expect(definitionInput).toHaveValue('Something');

    expect(screen.queryByText('Code')).not.toBeInTheDocument();
    expect(screen.queryByText('Definition')).not.toBeInTheDocument();
  });

  it('should render labels if "showLabels" is true', async () => {
    await page({ code: 'Hi', onLegendUpdated: jest.fn, showLabels: true });

    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Definition')).toBeInTheDocument();
  });

  it('should call "onLegendUpdated" on focus out or ENTER press', async () => {
    const onLegendUpdateMock = jest.fn();
    await page({
      code: 'Hi',
      onLegendUpdated: onLegendUpdateMock,
      definition: '',
    });

    const definitionInput = screen.getByTestId('definition-input');

    // should not call because the value was not changed
    fireEvent.focus(definitionInput);
    await userEvent.type(definitionInput, '{Enter}');
    fireEvent.blur(definitionInput);
    expect(onLegendUpdateMock).not.toHaveBeenCalled();

    // should call on ENTER press
    await userEvent.type(definitionInput, 'new value{Enter}');
    expect(definitionInput).toHaveValue('new value');
    expect(onLegendUpdateMock).toHaveBeenCalledWith({
      code: 'Hi',
      definition: 'new value',
    });

    // should call on focus out
    await userEvent.clear(screen.getByTestId('definition-input'));
    await userEvent.type(
      screen.getByTestId('definition-input'),
      'another value'
    );
    expect(screen.getByTestId('definition-input')).toHaveValue('another value');
    fireEvent.blur(screen.getByTestId('definition-input'));
    expect(onLegendUpdateMock).toHaveBeenCalledWith({
      code: 'Hi',
      definition: 'another value',
    });
  });

  it('should display component loading and success state when value is being updated', async () => {
    const { rerender, container } = page({
      code: 'TEST',
      onLegendUpdated: jest.fn(),
    });

    await userEvent.type(
      screen.getByTestId('definition-input'),
      'new value{Enter}'
    );

    /**
     * Check loading icon shows up when we trigger change
     * */
    // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
    expect(container.querySelector('i > svg')).toBeInTheDocument(); // check that loading icon is there
    rerender(
      <CodeDefinitionItem
        code="TEST"
        onLegendUpdated={jest.fn}
        definition="new value"
      />
    );

    /**
     * Check loading icon disappears and success state is visible
     * */
    // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
    expect(container.querySelector('i > svg')).not.toBeInTheDocument();
    expect(screen.getByTestId('definition-input')).toHaveClass('valid');

    // wait for success state to disappear
    await waitFor(() =>
      expect(screen.getByTestId('definition-input')).not.toHaveClass('valid')
    );
  });
});
