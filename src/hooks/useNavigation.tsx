import React from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useBaseUrl, useProjectUrl } from './useBaseUrl';

export type Navigation = {
  toDashboard: () => void;
  toHome: () => void;
  toLabel: (externalId: string) => void;
  toClassifier: (classifier: string, name?: string) => void;
};

const useBuildUrl = () => {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);

  const environment = query.get('env');

  return (url: string) =>
    [url, environment && `?env=${environment}`].filter(Boolean).join('');
};

export const useNavigation = (): Navigation => {
  const history = useHistory();
  const baseUrl = useBaseUrl();
  const buildUrl = useBuildUrl();
  const projectUrl = useProjectUrl();

  const toDashboard = () => {
    const url = buildUrl(`/${projectUrl}`);
    history.push(url);
  };

  const toHome = () => {
    const url = buildUrl(baseUrl);
    history.push(url);
  };

  const toLabel = (externalId: string) => {
    const url = buildUrl(
      `${baseUrl}/document/${encodeURIComponent(externalId)}`
    );
    history.push(url);
  };

  const toClassifier = (classifier: string) => {
    const url = buildUrl(
      `${baseUrl}/classifier/${encodeURIComponent(classifier)}`
    );
    history.push(url);
  };

  return {
    toDashboard,
    toHome,
    toLabel,
    toClassifier,
  };
};
