import {
  PageContent,
  PageHeader,
} from 'apps/cdf-document-search/src/components/page';
import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';
import { useClassifierId } from 'apps/cdf-document-search/src/machines/classifier/hooks/useClassifierSelectors';
import React from 'react';
import { useDocumentsActiveClassifierPipelineMutate } from 'apps/cdf-document-search/src/services/query/pipelines/mutate';
import { useDocumentsClassifierByIdQuery } from 'apps/cdf-document-search/src/services/query/classifier/query';
import { CommonClassifierPage } from 'apps/cdf-document-search/src/pages/Classifier/components/ClassifierPage';
import { ActiveModelContainer } from 'apps/cdf-document-search/src/pages/Home/components/container/ActiveModelContainer';
import { ClassifierProps } from '../router';
import { MatrixTable } from './components';
import { ReviewModelNavigation } from './components/navigation/ReviewModelNavigation';

// const test = {
//   projectId: 123,
//   name: 'name',
//   createdAt: 1628080015804,
//   status: 'finished',
//   active: true,
//   id: 4784470505715878,
//   metrics: {
//     precision: 0.9450549450549451,
//     recall: 0.9230769230769231,
//     f1Score: 0.9209401709401709,
//     confusionMatrix: [
//       [7, 0, 0, 0, 0, 0, 4],
//       [1, 3, 1, 0, 0, 0, 0],
//       [0, 0, 10, 0, 0, 0, 0],
//       [0, 0, 0, 10, 0, 0, 0],
//       [0, 0, 0, 0, 0, 0, 0],
//       [0, 0, 0, 0, 0, 11, 0],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//       [0, 0, 0, 0, 0, 0, 10],
//     ],
//     labels: [
//       'CORE_DESCRIPTION',
//       'APA_APPLICATION',
//       'PID',
//       'SCIENTIFIC_ARTICLE',
//       'FINAL_WELL_REPORT',
//       'RISK_ASSESSMENT',
//       'Unknown',
//     ],
//   },
// };

export const ReviewModel: React.FC<ClassifierProps> = ({ Widget }) => {
  const { toHome } = useNavigation();

  const classifierId = useClassifierId();
  const { data: classifier } = useDocumentsClassifierByIdQuery(classifierId);

  const { mutateAsync: updateActiveClassifierMutate } =
    useDocumentsActiveClassifierPipelineMutate();

  const handleDeployClassifierClick = () => {
    if (classifier) {
      updateActiveClassifierMutate(classifier.id)
        .then(() => {
          toHome();
        })
        .catch(() => null);
    }
  };

  return (
    <CommonClassifierPage
      Widget={Widget}
      Navigation={
        <ReviewModelNavigation onDeployClick={handleDeployClassifierClick} />
      }
    >
      <PageHeader title="Review Model" />

      <ActiveModelContainer classifier={classifier} />

      <PageContent>
        <MatrixTable classifier={classifier} />
      </PageContent>
    </CommonClassifierPage>
  );
};
