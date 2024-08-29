/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement, useEffect, useCallback } from 'react';

import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';

import { RuleBasedOutputsSelector } from '../RuleBasedOutputs/RuleBasedOutputsSelector';
import {
  type EmptyRuleForSelection,
  type RuleAndEnabled,
  type AllMappingStylingGroupAndStyleIndex,
  type AllRuleBasedStylingGroups
} from '../RuleBasedOutputs/types';
import { useTranslation } from '../i18n/I18n';
import { useFetchRuleInstances } from '../RuleBasedOutputs/hooks/useFetchRuleInstances';
import { use3dModels } from '../../hooks/use3dModels';
import { type CadModelOptions } from '../Reveal3DResources/types';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { RuleBasedSelectionItem } from '../RuleBasedOutputs/components/RuleBasedSelectionItem';
import { generateEmptyRuleForSelection, getRuleBasedById } from '../RuleBasedOutputs/utils';
import { useReveal3DResourcesStylingLoading } from '../Reveal3DResources/Reveal3DResourcesInfoContext';

type RuleBasedOutputsButtonProps = {
  onRuleSetStylingChanged?: (stylings: AllRuleBasedStylingGroups | undefined) => void;
  onRuleSetSelectedChanged?: (ruleSet: RuleAndEnabled | undefined) => void;
};
export const RuleBasedOutputsButton = ({
  onRuleSetStylingChanged,
  onRuleSetSelectedChanged
}: RuleBasedOutputsButtonProps): ReactElement => {
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];

  const [currentRuleSetEnabled, setCurrentRuleSetEnabled] = useState<RuleAndEnabled>();
  const [emptyRuleSelected, setEmptyRuleSelected] = useState<EmptyRuleForSelection>();
  const [currentStylingGroups, setCurrentStylingGroups] = useState<
    AllMappingStylingGroupAndStyleIndex[] | undefined
  >();
  const [ruleInstances, setRuleInstances] = useState<RuleAndEnabled[] | undefined>();

  const [isRuleLoading, setIsRuleLoading] = useState(false);

  const { isLoading: isAssetMappingsLoading } = useAssetMappedNodesForRevisions(cadModels);

  const [newRuleSetEnabled, setNewRuleSetEnabled] = useState<RuleAndEnabled>();
  const isRuleLoadingFromContext = useReveal3DResourcesStylingLoading();

  const [isAllMappingsFetched, setIsAllMappingsFetched] = useState(false);

  const { data: ruleInstancesResult } = useFetchRuleInstances();

  useEffect(() => {
    setRuleInstances(ruleInstancesResult);
  }, [ruleInstancesResult]);

  useEffect(() => {
    setCurrentRuleSetEnabled(newRuleSetEnabled);
    if (onRuleSetSelectedChanged !== undefined) onRuleSetSelectedChanged(newRuleSetEnabled);

    const hasNewRuleSetEnabled = newRuleSetEnabled !== undefined;

    setIsRuleLoading(hasNewRuleSetEnabled);
  }, [newRuleSetEnabled]);

  useEffect(() => {
    const hasRuleLoading =
      (currentStylingGroups !== undefined &&
        currentStylingGroups.length > 0 &&
        isRuleLoadingFromContext) ||
      !isAllMappingsFetched;

    setIsRuleLoading(hasRuleLoading);
  }, [isAllMappingsFetched, currentStylingGroups, isRuleLoadingFromContext, newRuleSetEnabled]);

  const onChange = useCallback(
    (data: string | undefined): void => {
      const emptySelection = generateEmptyRuleForSelection(
        t('RULESET_NO_SELECTION', 'No RuleSet selected')
      );

      ruleInstances?.forEach((item) => {
        if (item === undefined) return;
        item.isEnabled = false;
      });

      const selectedRule = getRuleBasedById(data, ruleInstances);

      if (selectedRule !== undefined) {
        selectedRule.isEnabled = true;
      } else {
        emptySelection.isEnabled = true;
        if (onRuleSetStylingChanged !== undefined) onRuleSetStylingChanged(undefined);
      }
      setEmptyRuleSelected(emptySelection);
      setNewRuleSetEnabled(selectedRule);
    },
    [ruleInstances, emptyRuleSelected, onRuleSetStylingChanged, onRuleSetSelectedChanged]
  );

  const ruleSetStylingChanged = (
    stylingGroups: AllMappingStylingGroupAndStyleIndex[] | undefined
  ): void => {
    setCurrentStylingGroups(stylingGroups);
    const assetStylingGroups = stylingGroups?.map(
      (group) => group.assetMappingsStylingGroupAndIndex.assetStylingGroup
    );
    const fdmStylingGroups = stylingGroups?.map(
      (group) => group.fdmStylingGroupAndStyleIndex.fdmStylingGroup
    );
    const allStylingGroups: AllRuleBasedStylingGroups = {
      assetStylingGroup: assetStylingGroups ?? [],
      fdmStylingGroup: fdmStylingGroups ?? []
    };

    if (onRuleSetStylingChanged !== undefined) onRuleSetStylingChanged(allStylingGroups);
  };

  if (ruleInstances === undefined || ruleInstances.length === 0) {
    return <></>;
  }

  return (
    <>
      <CogsTooltip
        content={t('RULESET_SELECT_HEADER', 'Select color overlay')}
        placement="right"
        appendTo={document.body}>
        <Dropdown
          placement="right-start"
          disabled={isAssetMappingsLoading}
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
                isLoading={isRuleLoading}
                isEmptyRuleItem={true}
              />
              {ruleInstances?.map((item) => (
                <RuleBasedSelectionItem
                  key={item?.rule?.properties.id}
                  id={item?.rule?.properties.id}
                  label={item?.rule?.properties.name}
                  checked={item?.isEnabled}
                  onChange={onChange}
                  isLoading={isRuleLoading}
                  isEmptyRuleItem={false}
                />
              ))}
            </Menu>
          }>
          <Button
            disabled={isAssetMappingsLoading}
            icon="ColorPalette"
            aria-label="Select RuleSet"
            type="ghost"
          />
        </Dropdown>
      </CogsTooltip>
      {ruleInstances !== undefined && ruleInstances?.length > 0 && (
        <RuleBasedOutputsSelector
          onRuleSetChanged={ruleSetStylingChanged}
          onAllMappingsFetched={setIsAllMappingsFetched}
          ruleSet={currentRuleSetEnabled?.rule.properties}
        />
      )}
    </>
  );
};
