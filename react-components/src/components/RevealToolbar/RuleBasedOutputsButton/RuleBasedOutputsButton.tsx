import { useState, type ReactElement, useEffect, useCallback, useContext } from 'react';

import { Button, Tooltip as CogsTooltip, ColorPaletteIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';

import {
  type EmptyRuleForSelection,
  type RuleAndEnabled,
  type AllMappingStylingGroupAndStyleIndex,
  type AllRuleBasedStylingGroups
} from '../../RuleBasedOutputs/types';
import { type CadModelOptions } from '../../Reveal3DResources/types';
import { offset } from '@floating-ui/react';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../../constants';
import { generateEmptyRuleForSelection } from '../../RuleBasedOutputs/core/generateEmptyRuleForSelection';
import { getRuleBasedById } from '../../RuleBasedOutputs/core/getRuleBasedById';
import { RuleBasedOutputsButtonContext } from './RuleBasedOutputsButton.context';

type RuleBasedOutputsButtonProps = {
  onRuleSetStylingChanged?: (stylings: AllRuleBasedStylingGroups | undefined) => void;
  onRuleSetSelectedChanged?: (ruleSet: RuleAndEnabled | undefined) => void;
};
export const RuleBasedOutputsButton = ({
  onRuleSetStylingChanged,
  onRuleSetSelectedChanged
}: RuleBasedOutputsButtonProps): ReactElement => {
  const {
    useTranslation,
    use3dModels,
    useAssetMappedNodesForRevisions,
    useReveal3DResourcesStylingLoading,
    useFetchRuleInstances,
    RuleBasedOutputsSelector,
    RuleBasedSelectionItem
  } = useContext(RuleBasedOutputsButtonContext);

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

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { isLoading: isAssetMappingsLoading, isFetched: isAssetMappingsFetched } =
    useAssetMappedNodesForRevisions(cadModels);

  const [newRuleSetEnabled, setNewRuleSetEnabled] = useState<RuleAndEnabled>();
  const isRuleLoadingFromContext = useReveal3DResourcesStylingLoading();

  const [isAllMappingsFetched, setIsAllMappingsFetched] = useState(false);

  const { data: ruleInstancesResult } = useFetchRuleInstances();

  const disabled = isAssetMappingsLoading && !isAssetMappingsFetched;
  const noRuleSetSelected =
    currentRuleSetEnabled === undefined || Boolean(emptyRuleSelected?.isEnabled);

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
      const emptySelection = generateEmptyRuleForSelection(t({ key: 'RULESET_NO_SELECTION' }));

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
    <Menu
      placement="right-start"
      style={{
        maxHeight: 300,
        overflow: 'auto',
        marginBottom: '20px'
      }}
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      disableCloseOnClickInside
      onOpenChange={(open: boolean) => {
        setIsExpanded(open);
      }}
      renderTrigger={(props: any) => (
        <CogsTooltip content={t({ key: 'RULESET_SELECT_HEADER' })} placement="right">
          <Button
            icon=<ColorPaletteIcon />
            disabled={disabled}
            aria-label="Select RuleSet"
            type="ghost"
            toggled={isExpanded || !noRuleSetSelected}
            {...props}
          />
        </CogsTooltip>
      )}>
      <Menu.Section label={t({ key: 'RULESET_SELECT_HEADER' })} />
      <RuleBasedSelectionItem
        key="no-rule-selected"
        id="no-rule-selected"
        label={t({ key: 'RULESET_NO_SELECTION' })}
        checked={noRuleSetSelected}
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
      {ruleInstances !== undefined && ruleInstances?.length > 0 && (
        <RuleBasedOutputsSelector
          onRuleSetChanged={ruleSetStylingChanged}
          onAllMappingsFetched={setIsAllMappingsFetched}
          ruleSet={currentRuleSetEnabled?.rule.properties}
        />
      )}
    </Menu>
  );
};
