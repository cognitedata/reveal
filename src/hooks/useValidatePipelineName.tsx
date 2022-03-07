import React from 'react';
import { Toast } from 'src/components/Toast';
import { useDocumentsPipelinesQuery } from 'src/services/query/pipelines/query';
import { useNavigation } from 'src/hooks/useNavigation';
import { useClassifierParams } from './useParams';

/**
 * Hook validates  classifier name when creating a new model
 * is valid up against the backend
 */
const useValidatePipelineName = () => {
  const { classifierName } = useClassifierParams();
  const { toHome } = useNavigation();

  const { data, isLoading } = useDocumentsPipelinesQuery();

  React.useEffect(() => {
    if (data && data.classifier?.name !== classifierName) {
      Toast.error({
        title: 'Invalid classifier name',
        message: `"${classifierName}" was not found in the backend.`,
      });
      toHome();
    }
  }, [classifierName, data, toHome]);

  return [isLoading];
};

export default useValidatePipelineName;
