import { PropsWithChildren } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { useLinks } from '@fdx/shared/hooks/useLinks';
import { ViewMode } from '@fdx/shared/hooks/useParams';
import { DataModelV2, Instance } from '@fdx/shared/types/services';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

export const Link = () => {
  return <></>;
};

const LinkGenericPage: React.FC<
  PropsWithChildren<{
    instance?: Instance;
    dataModel?: DataModelV2;
    options?: { viewMode?: ViewMode };
    disabled?: boolean;
  }>
> = ({ instance, dataModel, disabled, options, children }) => {
  const { instancePageLink } = useLinks();
  const { search } = useLocation();

  if (disabled || isEmpty(dataModel) || isEmpty(instance)) {
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

  if (isUndefined(externalId)) {
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
