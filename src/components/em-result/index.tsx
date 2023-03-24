import { Button, Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { AssetIdUpdate } from 'hooks/types';
import { useUpdateAssetIds } from 'hooks/update';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import { SourceType } from 'types/api';
import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';
import Step from 'components/step';

type Props = {
  predictJobId: number;
  sourceType: SourceType;
  predictions: Prediction[];
  sourceIdsSecondaryTopBar: number[];
  setSourceIdsSecondaryTopBar: Dispatch<SetStateAction<number[]>>;
  appliedRules?: AppliedRule[];
};
export default function EntityMatchingResult({
  predictJobId,
  predictions,
  sourceType,
  sourceIdsSecondaryTopBar,
  setSourceIdsSecondaryTopBar,
  appliedRules,
}: Props) {
  const [sourceIds, setSourceIds] = useState<number[]>([]);
  const { mutate, isLoading, status } = useUpdateAssetIds(
    sourceType,
    predictJobId
  );
  const [rulesView, setRulesView] = useState(false);

  const { t } = useTranslation();
  const applyAll = () => {
    const updates: AssetIdUpdate[] = predictions.map(({ source, match }) => ({
      id: source.id,
      update: {
        assetId: { set: match.target.id },
      },
    }));

    mutate(updates);
  };

  useEffect(
    () => setSourceIdsSecondaryTopBar(sourceIds),
    [sourceIds, setSourceIdsSecondaryTopBar, sourceIdsSecondaryTopBar]
  );

  return (
    <Step
      title={t('result-step-title', { step: 4 })}
      subtitle={t('result-step-subtitle')}
    >
      <StyledFlex direction="column">
        <Flex justifyContent="space-between">
          <Checkbox
            disabled={!appliedRules || appliedRules.length === 0}
            label="Group by pattern"
            checked={rulesView}
            onChange={(e) => setRulesView(e.target.checked)}
          />
          {!rulesView && (
            <StyledButton
              type="primary"
              disabled={isLoading}
              onClick={() => applyAll()}
            >
              {t('qm-results-apply-all')} <QueryStatusIcon status={status} />
            </StyledButton>
          )}
        </Flex>
        {rulesView ? (
          <AppliedRulesTable
            appliedRules={appliedRules}
            sourceType={sourceType}
            predictJobId={predictJobId}
          />
        ) : (
          <QuickMatchResultsTable
            predictions={predictions}
            sourceIds={sourceIds}
            setSourceIds={setSourceIds}
          />
        )}
      </StyledFlex>
    </Step>
  );
}

const StyledButton = styled(Button)`
  width: 150px;
  padding: 10px;
`;

const StyledFlex = styled(Flex)`
  padding: 20px;
`;
