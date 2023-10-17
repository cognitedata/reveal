import { PropsWithChildren } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { isEmpty } from 'lodash';

import { useLinks } from '../hooks/useLinks';
import { ViewMode } from '../hooks/useParams';
import { DataModelV2, Instance } from '../services/types';

export const Link = () => {
  return <></>;
};

const LinkGenericPage: React.FC<
  PropsWithChildren<{
    instance?: Instance;
    dataModel?: DataModelV2;
    options?: { viewMode?: ViewMode };
  }>
> = ({ instance, dataModel, options, children }) => {
  const { instancePageLink } = useLinks();
  const { search } = useLocation();

  if (isEmpty(dataModel) || isEmpty(instance)) {
    return <>{children}</>;
  }

  const queryParams = new URLSearchParams(search);
  // Assure that we are looking at the dashboard of the instance
  queryParams.set('viewMode', options?.viewMode ?? 'list');

  return (
    <StyledLink to={instancePageLink(dataModel, instance)}>
      {children}
    </StyledLink>
  );
};

const LinkFilePage: React.FC<
  PropsWithChildren<{ externalId?: string | number }>
> = ({ externalId, children }) => {
  const { filePageLink } = useLinks();
  const { search } = useLocation();

  if (!externalId) {
    return <>{children}</>;
  }

  const queryParams = new URLSearchParams(search);

  if (queryParams.has('expandedId')) {
    queryParams.delete('expandedId');
  }

  return <StyledLink to={filePageLink(externalId)}>{children}</StyledLink>;
};

const LinkTimeseriesPage: React.FC<
  PropsWithChildren<{ externalId?: string | number }>
> = ({ externalId, children }) => {
  const { search } = useLocation();
  const { timeseriesPageLink } = useLinks();

  if (!externalId) {
    return <>{children}</>;
  }

  const queryParams = new URLSearchParams(search);

  if (queryParams.has('expandedId')) {
    queryParams.delete('expandedId');
  }

  return (
    <StyledLink to={timeseriesPageLink(externalId, queryParams)}>
      {children}
    </StyledLink>
  );
};

Link.GenericPage = LinkGenericPage;
Link.FilePage = LinkFilePage;
Link.TimeseriesPage = LinkTimeseriesPage;

const StyledLink = styled(RouterLink).attrs({ style: { all: 'unset' } })``;
