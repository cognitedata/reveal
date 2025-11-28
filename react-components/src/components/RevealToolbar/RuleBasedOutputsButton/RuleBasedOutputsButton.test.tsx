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
import { type ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import { createAssetMappingMock } from '#test-utils/fixtures/cadAssetMapping';
import { type UseQueryResult } from '@tanstack/react-query';
import { type RuleAndEnabled, type RuleOutputSet } from '../../RuleBasedOutputs/types';
import { Mock } from 'moq.ts';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { type FdmNode } from '../../../data-providers/FdmSDK';

describe(RuleBasedOutputsButton.name, () => {
  const defaultProps = {
    onRuleSetStylingChanged: vi.fn(),
    onRuleSetSelectedChanged: vi.fn()
  };

  const deps = getMocksByDefaultDependencies(defaultRuleBasedOutputsButtonDependencies);
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <RuleBasedOutputsButtonContext.Provider value={deps}>
      {children}
    </RuleBasedOutputsButtonContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    const mockTranslation: I18nContent = {
      t: (translationInput) =>
        typeof translationInput === 'object' ? String(translationInput) : translationInput,
      currentLanguage: 'en'
    };

    deps.useTranslation.mockReturnValue(mockTranslation);

    const mockCadModel = createCadMock({ modelId: 123, revisionId: 456 });
    deps.use3dModels.mockReturnValue([mockCadModel]);

    const mockAssetMappingsResult = new Mock<UseQueryResult<ModelWithAssetMappings[]>>()
      .setup((x) => x.isInitialLoading)
      .returns(false)
      .setup((x) => x.isFetched)
      .returns(true)
      .setup((x) => x.data)
      .returns([
        {
          model: { modelId: 123, revisionId: 456, type: 'cad' },
          assetMappings: [createAssetMappingMock()]
        }
      ])
      .object();

    deps.useAssetMappedNodesForRevisions.mockReturnValue(mockAssetMappingsResult);

    deps.useReveal3DResourcesStylingLoading.mockReturnValue(false);

    const mockRuleInstances: RuleAndEnabled[] = [
      {
        rule: {
          properties: {
            id: 'rule1',
            name: 'Test Rule 1',
            rulesWithOutputs: [],
            createdAt: 1111,
            createdBy: 'Test User'
          },
          instanceType: 'node',
          version: 1,
          space: 'test-space',
          externalId: 'rule1',
          createdTime: 1111,
          lastUpdatedTime: 1111
        } satisfies FdmNode<RuleOutputSet>,
        isEnabled: false
      }
    ];

    const mockRuleInstancesResult = new Mock<UseQueryResult<RuleAndEnabled[], undefined>>()
      .setup((x) => x.data)
      .returns(mockRuleInstances)
      .setup((x) => x.isInitialLoading)
      .returns(false)
      .setup((x) => x.isFetched)
      .returns(true)
      .setup((x) => x.error)
      .returns(undefined)
      .object();

    deps.useFetchRuleInstances.mockReturnValue(mockRuleInstancesResult);

    deps.RuleBasedOutputsSelector.mockReturnValue(
      <div data-testid="rule-based-outputs-selector">Selector</div>
    );

    deps.RuleBasedSelectionItem.mockImplementation(
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
