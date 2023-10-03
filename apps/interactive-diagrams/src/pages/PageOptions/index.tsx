import React from 'react';

import { Body } from '@cognite/cogs.js';

import { Flex, PageTitle, CollapsibleRadio } from '../../components/Common';
import NavigationStickyBottomRow from '../../components/NavigationStickyBottomRow';
import { useActiveWorkflow, useSavedSettings } from '../../hooks';
import { ModelSelected } from '../../modules/types';
import { WorkflowStep } from '../../modules/workflows';

import {
  OptionPartialMatch,
  OptionMinTokens,
  OptionFieldsToMatch,
} from './AdvancedOptions';
import SkipSettingsPanel from './SkipSettingsPanel';
import StandardModelTooltip from './StandardModelTooltip';

type Props = {
  step: WorkflowStep;
};
export default function PageOptions(props: Props) {
  const { step } = props;
  const { workflowId } = useActiveWorkflow(step);

  const { modelSelected, setModelSelected } = useSavedSettings();

  const onModelSet = (model: string) =>
    setModelSelected(model as ModelSelected);

  return (
    <Flex column style={{ width: '100%' }}>
      <PageTitle
        title="Select model"
        subtitle="Select the model you want to be applied to create interactive diagrams"
      />
      <Flex row style={{ paddingBottom: '50px' }} data-cy="model-options">
        <Flex column style={{ width: '100%' }}>
          <CollapsibleRadio
            groupRadioValue={modelSelected}
            info={<StandardModelTooltip />}
            maxWidth={1024}
            name="standard"
            setGroupRadioValue={onModelSet}
            style={{ marginBottom: '14px' }}
            title="Standard model"
            value="standard"
          >
            <Body level={2}>
              This is recommended for most engineering diagrams.
            </Body>
          </CollapsibleRadio>
          <CollapsibleRadio
            collapse={
              <>
                <OptionPartialMatch workflowId={workflowId} />
                <OptionMinTokens workflowId={workflowId} />
                <OptionFieldsToMatch workflowId={workflowId} />
              </>
            }
            groupRadioValue={modelSelected}
            maxWidth={1024}
            name="advanced"
            setGroupRadioValue={onModelSet}
            title="Advanced model"
            value="advanced"
          >
            <Body level={2}>
              Allows you to configure advanced options such as number of tokens
              on the tag to match, partial matches, and other options.
            </Body>
          </CollapsibleRadio>
        </Flex>
        <SkipSettingsPanel />
      </Flex>
      <NavigationStickyBottomRow step={step} />
    </Flex>
  );
}
