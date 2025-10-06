import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { RuleBasedOutputsButton } from './RuleBasedOutputsButton';
import {
  RuleBasedOutputsButtonContext,
  defaultRuleBasedOutputsButtonDependencies
} from './RuleBasedOutputsButton.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type I18nContent } from '../../i18n/types';
import { type CogniteModel, type DataSourceType } from '@cognite/reveal';
import { type ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import { type UseQueryResult } from '@tanstack/react-query';
import { type RuleAndEnabled } from '../../RuleBasedOutputs/types';

describe(RuleBasedOutputsButton.name, () => {
  const defaultProps = {
    onRuleSetStylingChanged: vi.fn(),
    onRuleSetSelectedChanged: vi.fn()
  };

  const ruleBasedOutputsButtonDependencies = getMocksByDefaultDependencies(
    defaultRuleBasedOutputsButtonDependencies
  );

  const mockRuleInstances: RuleAndEnabled[] = [
    {
      rule: {
        properties: {
          id: 'rule1',
          name: 'Test Rule 1'
        }
      },
      isEnabled: false
    },
    {
      rule: {
        properties: {
          id: 'rule2',
          name: 'Test Rule 2'
        }
      },
      isEnabled: false
    }
  ] as RuleAndEnabled[];

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <RuleBasedOutputsButtonContext.Provider value={ruleBasedOutputsButtonDependencies}>
      {children}
    </RuleBasedOutputsButtonContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    const mockTranslation: I18nContent = {
      t: (translationInput) =>
        typeof translationInput === 'object' ? String(translationInput) : translationInput,
      currentLanguage: 'en'
    };
    ruleBasedOutputsButtonDependencies.useTranslation.mockReturnValue(mockTranslation);

    const mockModelData = {
      type: 'cad' as const,
      modelId: 123,
      revisionId: 456
    };
    const mockModels: Array<CogniteModel<DataSourceType>> = [
      mockModelData as CogniteModel<DataSourceType>
    ];
    ruleBasedOutputsButtonDependencies.use3dModels.mockReturnValue(mockModels);

    const mockAssetMappingsData = {
      isLoading: false,
      isFetched: true
    };
    const mockAssetMappings: UseQueryResult<ModelWithAssetMappings[]> =
      mockAssetMappingsData as UseQueryResult<ModelWithAssetMappings[]>;
    ruleBasedOutputsButtonDependencies.useAssetMappedNodesForRevisions.mockReturnValue(
      mockAssetMappings
    );

    ruleBasedOutputsButtonDependencies.useReveal3DResourcesStylingLoading.mockReturnValue(false);

    const mockRuleData = {
      data: mockRuleInstances
    };
    const mockRuleQueryResult: UseQueryResult<RuleAndEnabled[], undefined> =
      mockRuleData as UseQueryResult<RuleAndEnabled[], undefined>;
    ruleBasedOutputsButtonDependencies.useFetchRuleInstances.mockReturnValue(mockRuleQueryResult);

    ruleBasedOutputsButtonDependencies.RuleBasedOutputsSelector.mockReturnValue(
      <div data-testid="rule-based-outputs-selector">Selector</div>
    );

    ruleBasedOutputsButtonDependencies.RuleBasedSelectionItem.mockImplementation(
      ({ label, checked, onChange, id, isEmptyRuleItem }) => (
        <div data-testid={`rule-item-${id}`}>
          <input
            type="radio"
            name="rule-selection"
            checked={checked}
            onChange={() => {
              onChange?.(isEmptyRuleItem ? undefined : id);
            }}
            data-testid={`rule-checkbox-${id}`}
          />
          <span>{label}</span>
        </div>
      )
    );
  });

  test('toggles RuleBasedOutputsButton on click and shows toggled class', async () => {
    render(<RuleBasedOutputsButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Select RuleSet' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });

  test('stays toggled when a ruleset is selected even after clicking outside', async () => {
    render(
      <div>
        <RuleBasedOutputsButton {...defaultProps} />
        <div data-testid="outside-element">Outside</div>
      </div>,
      { wrapper }
    );

    const button = screen.getByRole('button', { name: 'Select RuleSet' });

    // Open the menu
    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');

    // Select a rule
    const ruleCheckbox = screen.getByTestId('rule-checkbox-rule1');
    await userEvent.click(ruleCheckbox);

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    await userEvent.click(outsideElement);

    // Button should still be toggled because a rule is selected
    expect(button).toHaveClass('cogs-button--toggled');
  });

  test('becomes untoggled when clicking outside and no ruleset is selected', async () => {
    render(
      <div>
        <RuleBasedOutputsButton {...defaultProps} />
        <div data-testid="outside-element">Outside</div>
      </div>,
      { wrapper }
    );

    const button = screen.getByRole('button', { name: 'Select RuleSet' });

    // Open the menu
    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');

    // Make sure no rule is selected (should be default state)
    const noSelectionCheckbox = screen.getByTestId('rule-checkbox-no-rule-selected');
    expect(noSelectionCheckbox).toBeChecked();

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    await userEvent.click(outsideElement);

    // Button should not be toggled since no rule is selected
    expect(button).not.toHaveClass('cogs-button--toggled');
  });
});
