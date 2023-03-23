import { Button, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRules, Rule } from 'hooks/entity-matching-rules';

import { useUpdateTimeseries } from 'hooks/timeseries';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import { SourceType } from 'types/api';
import QuickMatchResultsTable from './QuickMatchResultsTable';

type Props = {
  predictions: Prediction[];
  sourceIdsSecondaryTopBar: number[];
  setSourceIdsSecondaryTopBar: Dispatch<SetStateAction<number[]>>;
  sourceType: SourceType;
  rules?: Rule[];
  appliedRules?: AppliedRules[];
};
export default function EntityMatchingResult({
  predictions,
  sourceIdsSecondaryTopBar,
  setSourceIdsSecondaryTopBar,
}: Props) {
  const { mutate, isLoading, status } = useUpdateTimeseries();
  const [sourceIds, setSourceIds] = useState<number[]>([]);
  const { t } = useTranslation();
  const applyAll = () => {
    mutate(
      predictions.map(({ source, match }) => ({
        id: source.id,
        update: {
          assetId: { set: match.target.id },
        },
      }))
    );
  };

  useEffect(
    () => setSourceIdsSecondaryTopBar(sourceIds),
    [sourceIds, setSourceIdsSecondaryTopBar, sourceIdsSecondaryTopBar]
  );

  return (
    <StyledFlex direction="column">
      <Flex justifyContent="flex-end">
        <StyledButton
          type="primary"
          disabled={isLoading}
          onClick={() => applyAll()}
        >
          {t('qm-results-apply-all')} <QueryStatusIcon status={status} />
        </StyledButton>
      </Flex>
      <QuickMatchResultsTable
        predictions={predictions}
        sourceIds={sourceIds}
        setSourceIds={setSourceIds}
      />
    </StyledFlex>
  );
}

const StyledButton = styled(Button)`
  width: 150px;
  padding: 10px;
`;

const StyledFlex = styled(Flex)`
  padding: 20px;
`;
