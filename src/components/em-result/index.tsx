import { Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useState } from 'react';

import { SourceType } from 'types/api';
import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';
import QuickMatchActionBar from 'components/qm-action-bar/QuickMatchActionbar';
import Step from 'components/step';

type Props = {
  predictJobId: number;
  sourceType: SourceType;
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
  appliedRules?: AppliedRule[];
};
export default function EntityMatchingResult({
  predictJobId,
  predictions,
  sourceType,
  confirmedPredictions,
  setConfirmedPredictions,
  appliedRules,
}: Props) {
  const [rulesView, setRulesView] = useState(false);

  const { t } = useTranslation();

  const onClose = () => setSourceIds([]);

  return (
    <Container $isActionBarVisible={!!sourceIds.length}>
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
      <QuickMatchActionBar
        selectedRows={sourceIds}
        sourceType={sourceType}
        onClose={onClose}
      />
    </Container>
  );
}

const StyledButton = styled(Button)`
  width: 150px;
  padding: 10px;
`;

const StyledFlex = styled(Flex)`
  padding: 20px;
`;

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
