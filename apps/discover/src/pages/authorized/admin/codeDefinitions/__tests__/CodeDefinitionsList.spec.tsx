import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CodeDefinitionsList, Props } from '../components/CodeDefinitionsList';
import { CodeDefinition } from '../types';

const mockCodeDefinitions: CodeDefinition[] = [
  {
    code: 'TEST',
    definition: 'something',
  },
  {
    code: 'TEST2',
  },
];
describe('CodeDefinitionItem', () => {
  const page = ({ codeDefinitions, onLegendUpdated }: Props) =>
    render(
      <CodeDefinitionsList
        codeDefinitions={codeDefinitions}
        onLegendUpdated={onLegendUpdated}
      />
    );

  it('should render items correctly', async () => {
    await page({
      codeDefinitions: mockCodeDefinitions,
      onLegendUpdated: jest.fn(),
    });

    // should render the labels only for first item
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Definition')).toBeInTheDocument();

    // should render the codeDefinitionItems
    expect(screen.getAllByTestId('code-input')).toHaveLength(
      mockCodeDefinitions.length
    );
    expect(screen.getAllByTestId('definition-input')).toHaveLength(
      mockCodeDefinitions.length
    );
  });

  it('should emmit correct data onLegendUpdated', async () => {
    const onLegendUpdatedMock = jest.fn();
    await page({
      codeDefinitions: mockCodeDefinitions,
      onLegendUpdated: onLegendUpdatedMock,
    });

    await userEvent.type(
      screen.getAllByTestId('definition-input')[1],
      'new value{Enter}'
    );

    expect(onLegendUpdatedMock).toHaveBeenCalledWith({
      code: 'TEST2',
      definition: 'new value',
    });
  });
});
