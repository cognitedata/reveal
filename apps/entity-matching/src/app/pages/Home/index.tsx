import { Link, useParams, useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@entity-matching-app/common';
import { SOURCE_TABLE_QUERY_KEY } from '@entity-matching-app/common/constants';
import { CreatePipelineButton } from '@entity-matching-app/components/create-pipeline-button/CreatePipelineButton';
import NoAccessPage from '@entity-matching-app/components/error-pages/NoAccess';
import UnknownErrorPage from '@entity-matching-app/components/error-pages/UnknownError';
import NoWrapButton from '@entity-matching-app/components/no-wrap-button';
import PipelineList from '@entity-matching-app/components/pipeline-list';
import SearchInput from '@entity-matching-app/components/search-input';
import { useEMPipelines } from '@entity-matching-app/hooks/entity-matching-pipelines';

import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex } from '@cognite/cogs.js';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams('');
  const { error } = useEMPipelines();

  if (error) {
    if (error?.status === 403) {
      return (
        <ListWrapper>
          <Title level={3}>{t('entity-matching-pipelines')}</Title>
          <NoAccessPage />
        </ListWrapper>
      );
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
