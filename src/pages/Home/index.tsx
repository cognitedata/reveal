import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';

import PipelineList from 'components/pipeline-list';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import { useEMPipelines } from 'hooks/contextualization-api';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const { data, isInitialLoading, error } = useEMPipelines();

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  return (
    <ListWrapper>
      <Title level={3}>{t('entity-matching-pipelines')}</Title>
      <Link to={createLink(`/${subAppPath}/quick-match`)}>
        {t('quick-match')}
      </Link>
      <Link to={createLink(`/${subAppPath}/create`)}>
        {t('title-create-pipeline')}
      </Link>
      <PipelineList />
    </ListWrapper>
  );
}

const ListWrapper = styled(Flex).attrs({ direction: 'column' })`
  padding: 24px 40px;
`;
