import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBaseUrl, useProjectUrl } from './useBaseUrl';

export type Navigation = {
  toDashboard: () => void;
  toHome: () => void;
  toLabel: (externalId: string) => void;
  toLabels: () => void;
  toClassifier: (classifier?: string) => void;
  goBack: () => void;
  reload: () => void;
};

const useBuildUrl = () => {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);

  const environment = query.get('env');

  return (url: string) =>
    [url, environment && `?env=${environment}`].filter(Boolean).join('');
};

export const useNavigation = (): Navigation => {
  const navigate = useNavigate();
  const baseUrl = useBaseUrl();
  const buildUrl = useBuildUrl();
  const projectUrl = useProjectUrl();

  const toDashboard = () => {
    const url = buildUrl(`/${projectUrl}`);
    navigate(url);
  };

  const toHome = () => {
    const url = buildUrl(baseUrl);
    navigate(url);
  };

  const toLabel = (externalId: string) => {
    const url = buildUrl(`${baseUrl}/labels/${encodeURIComponent(externalId)}`);
    navigate(url);
  };

  const toLabels = () => {
    const url = buildUrl(`${baseUrl}/labels`);
    navigate(url);
  };

  const toClassifier = (classifier?: string) => {
    const url = buildUrl(
      `${baseUrl}/classifier/${encodeURIComponent(
        classifier ?? 'Document Type'
      )}`
    );
    navigate(url);
  };

  const goBack = () => {
    navigate(-1);
  };

  const reload = () => {
    window.location.reload();
  };

  return {
    toDashboard,
    toHome,
    toLabel,
    toLabels,
    toClassifier,
    goBack,
    reload,
  };
};
