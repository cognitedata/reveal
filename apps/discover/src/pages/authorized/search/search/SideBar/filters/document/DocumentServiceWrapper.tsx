import styled from 'styled-components/macro';

import { ProjectConfigGeneral } from '@cognite/discover-api-types';
import { reportException } from '@cognite/react-errors';

import Skeleton from 'components/skeleton';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { DocumentCategory } from 'modules/api/documents/types';
import { useDocumentCategoryQuery } from 'modules/api/documents/useDocumentQuery';
import { useDocumentQueryFacets } from 'modules/documentSearch/hooks/useDocumentQueryFacets';
import { sizes } from 'styles/layout';

const Wrapper = styled.div`
  padding: ${sizes.medium};
`;

interface Props {
  children(data: DocumentCategory): React.ReactNode;
}
export const DocumentServiceWrapper: React.FC<Props> = ({ children }) => {
  const { data: showDynamicResultCount } = useProjectConfigByKey<
    ProjectConfigGeneral['showDynamicResultCount']
  >('general.showDynamicResultCount');

  const { isLoading, error, data } = showDynamicResultCount
    ? useDocumentQueryFacets()
    : useDocumentCategoryQuery();

  if (isLoading) {
    return <Skeleton.List lines={4} borders />;
  }

  if (!data || error || 'error' in data) {
    reportException(error as Error);
    return <Wrapper>Something went wrong.</Wrapper>;
  }

  return <>{children(data)}</>;
};
