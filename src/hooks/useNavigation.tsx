import { useHistory } from 'react-router';
import { useBaseUrl } from './useBaseUrl';

export type Navigation = {
  toDocument: (externalId: string) => void;
  toClassifier: (classifier: string, name?: string) => void;
};
export const useNavigation = (): Navigation => {
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const toDocument = (externalId: string) => {
    history.push(`${baseUrl}/document/${externalId}`);
  };

  const toClassifier = (classifier: string, name?: string) => {
    history.push(`${baseUrl}/classifier/${classifier}/${name}`);
  };

  return {
    toDocument,
    toClassifier,
  };
};
