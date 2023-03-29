import { Checkbox, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Prediction } from 'hooks/entity-matching-predictions';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { Dispatch, SetStateAction, useState } from 'react';

import AppliedRulesTable from './applied-rules-table';
import QuickMatchResultsTable from './QuickMatchResultsTable';
import Step from 'components/step';

type Props = {
  predictions: Prediction[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
  appliedRules?: AppliedRule[];
};
export default function EntityMatchingResult({
  predictions,
  confirmedPredictions,
  setConfirmedPredictions,
  appliedRules,
}: Props) {
  const [rulesView, setRulesView] = useState(false);

  const { t } = useTranslation();

  return (
    <Step
      title={t('result-step-title', { step: 4 })}
      subtitle={t('result-step-subtitle')}
    >
      <Flex direction="column">
        <Flex justifyContent="space-between">
          <Checkbox
            disabled={!appliedRules || appliedRules.length === 0}
            label="Group by pattern"
            checked={rulesView}
            onChange={(e) => setRulesView(e.target.checked)}
          />
        </Flex>
        {rulesView ? (
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
      </Flex>
    </Step>
  );
}
