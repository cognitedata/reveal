import { useHistory } from 'react-router';
import { useBaseUrl } from './useBaseUrl';

export type Navigation = {
  toDocument: (externalId: string) => void;
  toClassifier: (classifier: string, name?: string) => void;
  toHome: () => void;
};
export const useNavigation = (): Navigation => {
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const toDocument = (externalId: string) => {
    history.push(`${baseUrl}/document/${externalId}`);
  };

  const toClassifier = (classifier: string, name?: string) => {
    if (name) {
      history.push(`${baseUrl}/classifier/${classifier}/${name}`);
    } else {
      history.push(`${baseUrl}/classifier/${classifier}`);
    }
  };

  const toHome = () => {
    history.push(baseUrl);
  };

  return {
    toHome,
    toDocument,
    toClassifier,
  };
};
