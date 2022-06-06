import { DocumentCategoriesFacets } from 'domain/documents/internal/types';
import { useDocumentCategoryQuery } from 'domain/documents/service/queries/useDocumentQuery';
import { DocumentError } from 'domain/documents/service/types';

import React from 'react';

import styled from 'styled-components/macro';
import { handleServiceError, PossibleError } from 'utils/errors';

import { DocumentCategories } from '@cognite/discover-api-types';

import Skeleton from 'components/Skeleton';
import { SOMETHING_WENT_WRONG } from 'constants/error';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useDocumentQueryFacets } from 'modules/documentSearch/hooks/useDocumentQueryFacets';
import { sizes } from 'styles/layout';

const Wrapper = styled.div`
  padding: ${sizes.medium};
`;

interface Props {
  children(
    data: DocumentCategories | DocumentCategoriesFacets
  ): React.ReactNode;
}

const Documents: React.FC<
  Props & {
    isLoading: boolean;
    data?: DocumentCategories | DocumentCategoriesFacets | DocumentError;
    error: unknown;
  }
> = ({ isLoading, data, error, children }) => {
  if (isLoading) {
    return <Skeleton.List lines={4} borders />;
  }

  if (!data || error || 'error' in data) {
    handleServiceError(error as PossibleError);
    return <Wrapper>{SOMETHING_WENT_WRONG}</Wrapper>;
  }

  return <>{children(data)}</>;
};

const DocumentFacets: React.FC<Props> = ({ children }) => {
  const { isLoading, error, data } = useDocumentQueryFacets();

  return (
    <Documents isLoading={isLoading} error={error} data={data}>
      {children}
    </Documents>
  );
};

const DocumentCategory: React.FC<Props> = ({ children }) => {
  const { isLoading, error, data } = useDocumentCategoryQuery();
  return (
    <Documents isLoading={isLoading} error={error} data={data}>
      {children}
    </Documents>
  );
};

export const DocumentServiceWrapper: React.FC<Props> = ({ children }) => {
  const { data: generalConfig } = useProjectConfigByKey('general');

  return generalConfig?.showDynamicResultCount ? (
    <DocumentFacets>{children}</DocumentFacets>
  ) : (
    <DocumentCategory>{children}</DocumentCategory>
  );
};
