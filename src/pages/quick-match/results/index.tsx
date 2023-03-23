import { useTranslation } from 'common';
import ApplySelectedMatchesButton from 'components/apply-selected-matches-button/ApplySelectedMatchesButton';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/contextualization-api';
import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const QuickMatchResults = (): JSX.Element => {
  const [sourceIds, setSourceIds] = useState<number[]>([]);
  const { jobId } = useParams<{
    jobId: string;
  }>();

  const { t } = useTranslation();

  const { data: predictions } = useEMModelPredictResults(
    parseInt(jobId ?? ''),
    {
      enabled: !!jobId,
      ...INFINITE_Q_OPTIONS,
    }
  );

  return (
    <>
      {!!predictions?.items && (
        <Page
          subtitle={t('results')}
          title={t('quick-match')}
          predictions={predictions.items}
          sourceIds={sourceIds}
          extraContent={
            <ApplySelectedMatchesButton
              predictions={predictions.items}
              sourceIds={sourceIds}
            />
          }
        >
          {predictions?.status === 'Completed' && (
            <EntityMatchingResult
              predictions={predictions.items}
              sourceIdsSecondaryTopBar={sourceIds}
              setSourceIdsSecondaryTopBar={setSourceIds}
            />
          )}
        </Page>
      )}
    </>
  );
};

export default QuickMatchResults;
