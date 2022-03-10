import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBaseUrl, useProjectUrl } from './useBaseUrl';

export type Navigation = {
  toDashboard: () => void;
  toHome: () => void;
  toLabel: (externalId: string) => void;
  toClassifier: () => void;
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
    const url = buildUrl(
      `${baseUrl}/classifier/labels/${encodeURIComponent(externalId)}`
    );
    navigate(url);
  };

  const toClassifier = () => {
    const url = buildUrl(`${baseUrl}/classifier`);
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
    toClassifier,
    goBack,
    reload,
  };
};
