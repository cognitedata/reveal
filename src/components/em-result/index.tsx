import { Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useState } from 'react';

import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';
import QuickMatchActionBar from 'components/qm-action-bar/QuickMatchActionbar';
import Step from 'components/step';
import styled from 'styled-components';
import { SourceType } from 'types/api';

type Props = {
  sourceType: SourceType;
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
  appliedRules?: AppliedRule[];
};
export default function EntityMatchingResult({
  sourceType,
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
  appliedRules,
}: Props) {
  const [rulesView, setRulesView] = useState(false);

  const { t } = useTranslation();

  const onClose = () => setConfirmedPredictions([]);

  return (
    <Container $isActionBarVisible={!!confirmedPredictions.length}>
      <Step
        title={t('result-step-title', { step: 4 })}
        subtitle={t('result-step-subtitle')}
      >
        <StyledFlex direction="column">
          {appliedRules && (
            <Flex justifyContent="space-between">
              <Checkbox
                label={t('group-by-pattern')}
                checked={rulesView}
                onChange={(e) => setRulesView(e.target.checked)}
              />
            </Flex>
          )}
          {rulesView && appliedRules ? (
            <AppliedRulesTable
              appliedRules={appliedRules}
              predictions={predictions}
              confirmedPredictions={confirmedPredictions}
              setConfirmedPredictions={setConfirmedPredictions}
            />
          ) : (
            <QuickMatchResultsTable
              predictions={predictions}
              confirmedPredictions={confirmedPredictions}
              setConfirmedPredictions={setConfirmedPredictions}
            />
          )}
        </StyledFlex>
      </Step>
      <QuickMatchActionBar
        selectedRows={confirmedPredictions}
        sourceType={sourceType}
        onClose={onClose}
      />
    </Container>
  );
}

const StyledFlex = styled(Flex)`
  padding: 20px;
`;

const Container = styled.div<{ $isActionBarVisible?: boolean }>`
  overflow-y: auto;
  padding-bottom: ${({ $isActionBarVisible }) =>
    $isActionBarVisible ? 56 : 0}px;
`;
