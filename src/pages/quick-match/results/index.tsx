import { useTranslation } from 'common';
import ApplySelectedMatchesButton from 'components/apply-selected-matches-button/ApplySelectedMatchesButton';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/contextualization-api';
import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { SourceType } from 'types/api';
import { sessionStorageKey } from 'utils';

const QuickMatchResults = (): JSX.Element => {
  const [sourceIds, setSourceIds] = useState<number[]>([]);
  const { subAppPath, jobId, sourceType } = useParams<{
    subAppPath: string;
    jobId: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const id = parseInt(jobId ?? '', 10);
  const token = sessionStorage.getItem(sessionStorageKey(id));
  const { data: predictions } = useEMModelPredictResults(id, token!, {
    enabled: !!jobId,
    ...INFINITE_Q_OPTIONS,
  });

  if (!sourceType) {
    return <Navigate to={`/${subAppPath}/quick-match/}`} replace={true} />;
  }

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
              sourceType={sourceType}
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
