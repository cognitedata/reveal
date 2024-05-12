/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement, useEffect } from 'react';

import {
  Button,
  Dropdown,
  Flex,
  Icon,
  Menu,
  Tooltip as CogsTooltip,
  Radio
} from '@cognite/cogs.js';

import { RuleBasedOutputsSelector } from '../RuleBasedOutputs/RuleBasedOutputsSelector';
import {
  type AssetStylingGroupAndStyleIndex,
  type RuleAndEnabled
} from '../RuleBasedOutputs/types';
import { useTranslation } from '../i18n/I18n';
import { useFetchRuleInstances } from '../RuleBasedOutputs/hooks/useFetchRuleInstances';
import { use3dModels } from '../../hooks/use3dModels';
import { type AssetStylingGroup } from '../..';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingCacheProvider';

type EmptyRule = {
  rule: any;
  isEnabled: boolean;
};
type RuleBasedOutputsButtonProps = {
  onRuleSetStylingChanged?: (stylings: AssetStylingGroup[] | undefined) => void;
  onRuleSetSelectedChanged?: (ruleSet: RuleAndEnabled | EmptyRule | undefined) => void;
};
export const RuleBasedOutputsButton = ({
  onRuleSetStylingChanged,
  onRuleSetSelectedChanged
}: RuleBasedOutputsButtonProps): ReactElement => {
  const [currentRuleSetEnabled, setCurrentRuleSetEnabled] = useState<RuleAndEnabled>();
  const [emptyRuleSelected, setEmptyRuleSelected] = useState<EmptyRule>();
  const [ruleInstances, setRuleInstances] =
    useState<Array<RuleAndEnabled | EmptyRule | undefined>>();
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];
  const { isLoading } = useAssetMappedNodesForRevisions(cadModels);

  const ruleInstancesResult = useFetchRuleInstances();

  const emptySelection: EmptyRule = {
    rule: { properties: { id: '', name: t('RULESET_NO_SELECTION', 'No RuleSet selected') } },
    isEnabled: false
  };

  useEffect(() => {
    if (ruleInstancesResult.data === undefined) return;

    setRuleInstances(ruleInstancesResult.data);
  }, [ruleInstancesResult]);

  const onChange = (data: string | undefined): void => {
    ruleInstances?.forEach((item) => {
      if (item === undefined) return;
      item.isEnabled = false;
    });
    emptySelection.isEnabled = false;

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
    setRuleInstances(ruleInstances);
  };

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
              <Menu.Item key="no-rule-selected">
                <Flex justifyContent="space-between" alignItems="center" gap={8}>
                  <Flex gap={4} alignItems="center">
                    <Icon type="ColorPalette" />
                    {t('RULESET_NO_SELECTION', 'No RuleSet selected')}
                  </Flex>
                  <Radio
                    name={'no-selection'}
                    value={'no-selection'}
                    checked={emptyRuleSelected?.isEnabled}
                    onChange={(_: any, value: string | undefined) => {
                      onChange(value);
                    }}
                  />
                </Flex>
              </Menu.Item>
              {ruleInstances?.map((item) => (
                <Menu.Item key={item?.rule?.properties.id}>
                  <Flex justifyContent="space-between" alignItems="center" gap={8}>
                    <Flex gap={4} alignItems="center">
                      <Icon type="ColorPalette" />
                      {item?.rule?.properties.name}
                    </Flex>
                    <Radio
                      name={item?.rule?.properties.id}
                      value={item?.rule?.properties.id}
                      checked={item?.isEnabled}
                      onChange={(_: any, value: string | undefined) => {
                        onChange(value);
                      }}
                    />
                  </Flex>
                </Menu.Item>
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
