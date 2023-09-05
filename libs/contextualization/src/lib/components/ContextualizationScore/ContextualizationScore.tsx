import styled from 'styled-components';

import { Tooltip, Dropdown } from '@cognite/cogs.js';

import { useAdvancedJoin, useEstimateQuality } from '../../hooks';
import { useCurrentView } from '../../hooks/models/useCurrentView';

import { ContextualizationScoreInfoPanel } from './ContextualizationScoreInfoPanel';
import { PercentageChip } from './tabs/PercentageChip';

export const ContextualizationScore = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  const view = useCurrentView();

  const { advancedJoin, isLoading } = useAdvancedJoin(headerName, view);

  const {
    externalId = undefined,
    matchers: [
      {
        dbName = undefined,
        tableName = undefined,
        fromColumnKey = undefined,
        toColumnKey = undefined,
      } = {},
    ] = [],
  } = advancedJoin || {};

  const {
    estimateQualityJobStatus,
    contextualizationScorePercent,
    estimatedCorrectnessScorePercent,
    confidencePercent,
  } = useEstimateQuality(
    externalId,
    dbName,
    tableName,
    fromColumnKey,
    toColumnKey
  );

  return (
    <ContextualizationScoreButton
      appendTo={document.getElementById('dataPreviewTableWrapper')!}
      content={
        <ContextualizationScoreInfoPanel
          headerName={headerName}
          dataModelType={dataModelType}
          estimateQualityJobStatus={estimateQualityJobStatus}
          contextualizationScorePercent={contextualizationScorePercent}
          estimatedCorrectnessScorePercent={estimatedCorrectnessScorePercent}
          confidencePercent={confidencePercent}
        />
      }
      placement="bottom-start"
    >
      <Tooltip
        content="Learn more about your Estimated Correctness"
        placement="bottom"
      >
        <PercentageChip
          value={contextualizationScorePercent}
          status={estimateQualityJobStatus}
          isLoading={isLoading}
        />
      </Tooltip>
    </ContextualizationScoreButton>
  );
};

const ContextualizationScoreButton = styled(Dropdown)`
  margin-left: 3px;
  &:hover {
    cursor: pointer;
  }
`;
