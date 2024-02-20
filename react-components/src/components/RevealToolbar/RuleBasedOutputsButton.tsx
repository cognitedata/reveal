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
import { type RuleAndEnabled } from '../RuleBasedOutputs/types';
import { useTranslation } from '../i18n/I18n';
import { useFetchRuleInstances } from '../RuleBasedOutputs/hooks/useFetchRuleInstances';

export const RuleBasedOutputsButton = (): ReactElement => {
  const [currentRuleSetEnabled, setCurrentRuleSetEnabled] = useState<RuleAndEnabled>();
  const [ruleInstances, setRuleInstances] = useState<RuleAndEnabled[]>();
  const { t } = useTranslation();

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

    setRuleInstances(ruleInstances);
    setCurrentRuleSetEnabled(selectedRule);

    if (selectedRule === undefined) return;
    selectedRule.isEnabled = data.target.checked;
  };

  return (
    <>
      <CogsTooltip
        content={t('RULEBASED_TOOLTIP', 'Rule Based Color Overlays')}
        placement="right"
        appendTo={document.body}>
        <Dropdown
          placement="right-start"
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
        <RuleBasedOutputsSelector ruleSet={currentRuleSetEnabled?.rule.properties} />
      )}
    </>
  );
};
