import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex } from '@cognite/cogs.js';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { CreatePipelineButton } from 'components/create-pipeline-button/CreatePipelineButton';
import PipelineList from 'components/pipeline-list';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <ListWrapper>
      <Title level={3}>{t('entity-matching-pipelines')}</Title>
      <Link to={createLink(`/${subAppPath}/quick-match/create/select-sources`)}>
        {t('quick-match')}
      </Link>
      <CreatePipelineButton />
      <PipelineList />
    </ListWrapper>
  );
}

const ListWrapper = styled(Flex).attrs({ direction: 'column' })`
  padding: 24px 40px;
`;
