import React, { useContext } from 'react';
import { Label } from '@cognite/cogs.js';
import { AppStateContext } from 'context';
import { WorkflowStep } from 'modules/workflows';
import { useJobStatusLabels } from 'hooks';
import { capitalizeFirstLetter } from 'modules/contextualization/utils';
import { StyledAdditionalText } from './components';

export const StepLabel = ({ step }: { step?: WorkflowStep }): JSX.Element => {
  const { modelSelected, resourceCount } = useContext(AppStateContext);
  const { jobLabel, labelVariant } = useJobStatusLabels();

  if (step === 'config')
    return (
      <StyledAdditionalText level={2}>
        {capitalizeFirstLetter(modelSelected)}
      </StyledAdditionalText>
    );
  if (step === 'diagramSelection')
    return (
      <StyledAdditionalText level={2}>{`${
        resourceCount.diagrams ?? 'None'
      } selected`}</StyledAdditionalText>
    );
  if (step === 'review') {
    return (
      <div>
        <Label size="small" variant={labelVariant}>
          {jobLabel}
        </Label>
      </div>
    );
  }
  if (step === 'resourceSelectionAssets' || step === 'resourceSelectionFiles') {
    const counts = [];
    const assetsCount = resourceCount?.assets;
    const filesCount = resourceCount?.files;
    if (assetsCount) counts.push(`${assetsCount} assets`);
    if (filesCount) counts.push(`${filesCount} diagrams`);

    const label = `${!counts?.length ? 'None' : counts.join(', ')} selected`;

    return <StyledAdditionalText level={2}>{label}</StyledAdditionalText>;
  }
  return <span />;
};
