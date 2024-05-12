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
  Switch,
  Tooltip as CogsTooltip
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

type RuleBasedOutputsButtonProps = {
  onRuleSetStylingChanged?: (stylings: AssetStylingGroup[] | undefined) => void;
};
export const RuleBasedOutputsButton = ({
  onRuleSetStylingChanged
}: RuleBasedOutputsButtonProps): ReactElement => {
  const [currentRuleSetEnabled, setCurrentRuleSetEnabled] = useState<RuleAndEnabled>();
  const [ruleInstances, setRuleInstances] = useState<RuleAndEnabled[]>();
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];
  const { isLoading } = useAssetMappedNodesForRevisions(cadModels);

  const ruleInstancesResult = useFetchRuleInstances();

  useEffect(() => {
    if (ruleInstancesResult.data === undefined) return;

    setRuleInstances(ruleInstancesResult.data);
  }, [ruleInstancesResult]);

  const onChange = (data: { target: { id: string | number; checked: boolean } }): void => {
    ruleInstances?.forEach((item) => {
      item.isEnabled = false;
    });
    const selectedRule = ruleInstances?.find((item) => {
      return item.rule.properties.id === data.target.id && data.target.checked;
    });

    if (selectedRule !== undefined) {
      selectedRule.isEnabled = data.target.checked;
    } else {
      if (onRuleSetStylingChanged !== undefined) onRuleSetStylingChanged(undefined);
    }
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
              {ruleInstances?.map((item) => (
                <Menu.Item key={item.rule.properties.id}>
                  <Flex justifyContent="space-between" alignItems="center" gap={8}>
                    <Flex gap={4} alignItems="center">
                      <Icon type="ColorPalette" />
                      {item.rule.properties.name}
                    </Flex>
                    <Switch
                      checked={item.isEnabled}
                      id={item.rule.properties.id}
                      name={item.rule.properties.id}
                      onChange={onChange}
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
