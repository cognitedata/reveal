import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex } from '@cognite/cogs.js';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import { useEMPipelines } from 'hooks/contextualization-api';

import { useTranslation } from 'common';
import { CreatePipelineButton } from 'components/create-pipeline-button/CreatePipelineButton';
import PipelineList from 'components/pipeline-list';
import { SOURCE_TABLE_QUERY_KEY } from 'common/constants';
import NoWrapButton from 'components/no-wrap-button';
import SearchInput from 'components/search-input';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams('');
  const { error } = useEMPipelines();

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  return (
    <ListWrapper>
      <Title level={3}>{t('entity-matching-pipelines')}</Title>
      <TopRow gap={22} alignItems="center" justifyContent="space-between">
        <SearchInput
          placeholder={t('filter-placeholder')}
          onChange={(e) => {
            searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
          value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
        />
        <Flex gap={12}>
          <Link
            to={createLink(`/${subAppPath}/quick-match/create/select-sources`)}
          >
            <NoWrapButton type="primary" icon="GanttChart">
              {t('quick-match')}
            </NoWrapButton>
          </Link>
          <CreatePipelineButton />
        </Flex>
      </TopRow>
      <PipelineList />
    </ListWrapper>
  );
}

const TopRow = styled(Flex)`
  margin-top: 40px;
`;

const ListWrapper = styled(Flex).attrs({ direction: 'column' })`
  padding: 24px 40px;
`;
