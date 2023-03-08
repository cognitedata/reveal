import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';

import PipelineList from 'components/pipeline-list';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <ListWrapper>
      <Title level={3}>{t('entity-matching-pipelines')}</Title>
      <Link to={createLink(`/${subAppPath}/quick-match/create`)}>
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
