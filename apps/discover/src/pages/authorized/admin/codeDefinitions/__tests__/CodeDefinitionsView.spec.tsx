import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LOADING_TEXT, NO_RESULTS_TEXT } from 'components/EmptyState/constants';

import { CodeDefinitionsView, Props } from '../components/CodeDefinitionsView';
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

describe('CodeDefinitionsView', () => {
  const page = ({
    title,
    codeDefinitions,
    isLoading,
    onLegendUpdated,
  }: Props) =>
    render(
      <CodeDefinitionsView
        title={title}
        codeDefinitions={codeDefinitions}
        isLoading={isLoading}
        onLegendUpdated={onLegendUpdated}
      />
    );

  const title = 'This is some Title';
  it('should render title and loading states correctly', async () => {
    const { rerender } = await page({
      title,
      isLoading: true,
      codeDefinitions: [],
      onLegendUpdated: jest.fn(),
    });

    // should show title and breadcrumbs
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();

    expect(
      within(screen.getByTestId('breadcrumbs')).getByText('Code definitions')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('breadcrumbs')).getByText(title)
    ).toBeInTheDocument();

    // should render loading state when isLoading is true and codeDefinitions is empty
    expect(screen.getByTestId('empty-state-container')).toBeInTheDocument();
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();

    // should render empty state when isLoading is false and codeDefinitions is empty
    await rerender(
      <CodeDefinitionsView
        title={title}
        isLoading={false}
        codeDefinitions={[]}
        onLegendUpdated={jest.fn()}
      />
    );
    expect(screen.getByTestId('empty-state-container')).toBeInTheDocument();
    expect(screen.queryByText(LOADING_TEXT)).not.toBeVisible();
    expect(screen.getByText(NO_RESULTS_TEXT)).toBeInTheDocument();

    // should render code definitions list when isLoading is false and codeDefinitions is not empty

    await rerender(
      <CodeDefinitionsView
        title={title}
        isLoading={false}
        codeDefinitions={mockCodeDefinitions}
        onLegendUpdated={jest.fn()}
      />
    );

    expect(screen.getAllByTestId('code-input')).toHaveLength(
      mockCodeDefinitions.length
    );
    expect(screen.getAllByTestId('definition-input')).toHaveLength(
      mockCodeDefinitions.length
    );
  });

  it('should trigger onLegendUpdatedCorrectly', async () => {
    const onLegendUpdatedMock = jest.fn();
    await page({
      title,
      isLoading: false,
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
