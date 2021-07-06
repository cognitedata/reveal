import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { Button, Body, useLocalStorage } from '@cognite/cogs.js';
import { WorkflowStep } from 'modules/workflows';
import {
  useActiveWorkflow,
  useSavedSettings,
  useSteps,
  getSelectedModel,
} from 'hooks';
import { Flex, PageTitle, CollapsibleRadio } from 'components/Common';
import StickyBottomRow from 'components/StickyBottomRow';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import {
  OptionPartialMatch,
  OptionMinTokens,
  OptionFieldsToMatch,
} from './AdvancedOptions';
import StandardModelTooltip from './StandardModelTooltip';
import SkipSettingsPanel from './SkipSettingsPanel';

type Props = {
  step: WorkflowStep;
};
export default function PageOptions(props: Props) {
  const { step } = props;
  const { workflowId } = useActiveWorkflow(step);
  const { goToNextStep, goToPrevStep } = useSteps(step);
  const [savedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
    modelSelected: 'standard',
  });
  const { options } = useSelector(
    (state: RootState) => state.workflows.items[workflowId]
  );
  const [shouldSkipSettings, setShouldSkipSettings] = useState<boolean>(
    savedSettings?.skip ?? false
  );
  const [modelSelected, setModelSelected] = useState(
    getSelectedModel(options, savedSettings?.modelSelected)
  );

  useSavedSettings({
    step,
    modelSelected,
    shouldSkipSettings,
  });

  const onSkipSettingsChange = (skipSettings: boolean) => {
    trackUsage(PNID_METRICS.configPage.skipSettings, { skip: skipSettings });
    setShouldSkipSettings(skipSettings);
  };

  const onNextButtonClick = () => goToNextStep();
  const onBackButtonClick = () => goToPrevStep();

  return (
    <Flex column style={{ width: '100%' }}>
      <PageTitle>Select model</PageTitle>
      <Body level={1} style={{ margin: '16px 0' }}>
        Select the model you want to be applied to create interactive diagrams
      </Body>
      <Flex row style={{ paddingBottom: '50px' }}>
        <Flex column style={{ width: '100%' }}>
          <CollapsibleRadio
            name="standard"
            value="standard"
            title="Standard model"
            info={<StandardModelTooltip />}
            groupRadioValue={modelSelected}
            setGroupRadioValue={setModelSelected as (value: string) => void}
            maxWidth={1024}
            style={{ marginBottom: '14px' }}
          >
            <Body level={2}>
              Uses the default set of configurations for creating interactive
              engineering diagrams. This is recommended for most engineering
              diagrams.
            </Body>
          </CollapsibleRadio>
          <CollapsibleRadio
            name="advanced"
            value="advanced"
            title="Advanced model"
            groupRadioValue={modelSelected}
            setGroupRadioValue={setModelSelected as (value: string) => void}
            maxWidth={1024}
            collapse={
              <>
                <OptionPartialMatch workflowId={workflowId} />
                <OptionMinTokens workflowId={workflowId} />
                <OptionFieldsToMatch workflowId={workflowId} />
              </>
            }
          >
            <Body level={2}>
              Allows you to configure advanced options such as number of tokens
              matched for an entity, partial matches and others.
            </Body>
          </CollapsibleRadio>
        </Flex>
        <SkipSettingsPanel
          shouldSkipSettings={shouldSkipSettings}
          onSkipSettingsChange={onSkipSettingsChange}
        />
      </Flex>
      <StickyBottomRow justify="space-between">
        <Button size="large" type="secondary" onClick={onBackButtonClick}>
          Back
        </Button>
        <Button size="large" type="primary" onClick={onNextButtonClick}>
          Next
        </Button>
      </StickyBottomRow>
    </Flex>
  );
}
