/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement, useEffect, useCallback } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';

import { RuleBasedOutputsSelector } from '../RuleBasedOutputs/RuleBasedOutputsSelector';
import {
  type EmptyRuleForSelection,
  type AssetStylingGroupAndStyleIndex,
  type RuleAndEnabled
} from '../RuleBasedOutputs/types';
import { useTranslation } from '../i18n/I18n';
import { useFetchRuleInstances } from '../RuleBasedOutputs/hooks/useFetchRuleInstances';
import { use3dModels } from '../../hooks/use3dModels';
import { type AssetStylingGroup } from '../..';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingCacheProvider';
import { RuleBasedSelectionItem } from '../RuleBasedOutputs/components/RuleBasedSelectionItem';

type RuleBasedOutputsButtonProps = {
  onRuleSetStylingChanged?: (stylings: AssetStylingGroup[] | undefined) => void;
  onRuleSetSelectedChanged?: (ruleSet: RuleAndEnabled | undefined) => void;
};
export const RuleBasedOutputsButton = ({
  onRuleSetStylingChanged,
  onRuleSetSelectedChanged
}: RuleBasedOutputsButtonProps): ReactElement => {
  const [currentRuleSetEnabled, setCurrentRuleSetEnabled] = useState<RuleAndEnabled>();
  const [emptyRuleSelected, setEmptyRuleSelected] = useState<EmptyRuleForSelection>();
  const [ruleInstances, setRuleInstances] = useState<RuleAndEnabled[] | undefined>();
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];
  const { isLoading } = useAssetMappedNodesForRevisions(cadModels);

  const ruleInstancesResult = useFetchRuleInstances();

  useEffect(() => {
    if (ruleInstancesResult.data === undefined) return;

    setRuleInstances(ruleInstancesResult.data);
  }, [ruleInstancesResult]);

  const onChange = useCallback(
    (data: string | undefined): void => {
      ruleInstances?.forEach((item) => {
        if (item === undefined) return;
        item.isEnabled = false;
      });

      const emptySelection: EmptyRuleForSelection = {
        rule: {
          properties: {
            id: undefined,
            name: t('RULESET_NO_SELECTION', 'No RuleSet selected'),
            isNoSelection: true
          }
        },
        isEnabled: false
      };

      const selectedRule = ruleInstances?.find((item) => {
        return item?.rule?.properties.id === data;
      });

      if (selectedRule !== undefined) {
        selectedRule.isEnabled = true;
      } else {
        emptySelection.isEnabled = true;
        if (onRuleSetStylingChanged !== undefined) onRuleSetStylingChanged(undefined);
      }

      if (onRuleSetSelectedChanged !== undefined) onRuleSetSelectedChanged(selectedRule);

      setEmptyRuleSelected(emptySelection);
      setCurrentRuleSetEnabled(selectedRule);
    },
    [ruleInstances, onRuleSetStylingChanged, onRuleSetSelectedChanged]
  );

  const ruleSetStylingChanged = (
    stylingGroups: AssetStylingGroupAndStyleIndex[] | undefined
  ): void => {
    const assetStylingGroups = stylingGroups?.map((group) => group.assetStylingGroup);
    if (onRuleSetStylingChanged !== undefined) onRuleSetStylingChanged(assetStylingGroups);
  };

  return (
    <>
      <CogsTooltip
        content={t('RULESET_SELECT_HEADER', 'Select color overlay')}
        placement="right"
        appendTo={document.body}>
        <Dropdown
          placement="right-start"
          disabled={isLoading}
          content={
            <Menu
              style={{
                maxHeight: 300,
                overflow: 'auto',
                marginBottom: '20px'
              }}>
              <Menu.Header>{t('RULESET_SELECT_HEADER', 'Select color overlay')}</Menu.Header>
              <RuleBasedSelectionItem
                key="no-rule-selected"
                id="no-rule-selected"
                label={t('RULESET_NO_SELECTION', 'No RuleSet selected')}
                checked={currentRuleSetEnabled === undefined || emptyRuleSelected?.isEnabled}
                onChange={onChange}
              />
              {ruleInstances?.map((item) => (
                <RuleBasedSelectionItem
                  key={item?.rule?.properties.id}
                  id={item?.rule?.properties.id}
                  label={item?.rule?.properties.name}
                  checked={item?.isEnabled}
                  onChange={onChange}
                />
              ))}
            </Menu>
          }>
          <Button icon="ColorPalette" aria-label="Select RuleSet" type="ghost" />
        </Dropdown>
      </CogsTooltip>
      {ruleInstances !== undefined && ruleInstances?.length > 0 && (
        <RuleBasedOutputsSelector
          onRuleSetChanged={ruleSetStylingChanged}
          ruleSet={currentRuleSetEnabled?.rule.properties}
        />
      )}
    </>
  );
};
