import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Body, Chip, Flex, Loader, Title } from '@cognite/cogs.js';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { ContentContainer } from 'components/ContentContainer';
import { useSolutionsForSourceSystem } from 'hooks/useSolutions';
import { useSourceSystem } from 'hooks/useSourceSystems';
import { useTranslation } from 'common';
import ReactMarkdown from 'react-markdown';
import SolutionForSourceSystem from 'components/solution/SolutionForSourceSystem';

const SourceSystemDetails = () => {
  const { t } = useTranslation();

  const { sourceSystemExternalId = '' } = useParams<{
    sourceSystemExternalId?: string;
  }>();

  const { data: sourceSystem, status } = useSourceSystem(
    sourceSystemExternalId
  );

  const { data: solutions } = useSolutionsForSourceSystem(
    sourceSystemExternalId
  );

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Layout>
      <DetailsHeader
        imageUrl={sourceSystem?.imageUrl}
        title={String(sourceSystem?.name)}
      />
      <ContentContainer>
        <Layout.Container>
          <StyledLayoutGrid>
            <Flex direction="column" gap={32}>
              <Body level={2}>
                <ReactMarkdown>
                  {(sourceSystem?.documentation || sourceSystem?.description) ??
                    ''}
                </ReactMarkdown>
              </Body>
              {sourceSystem?.name && !!solutions?.length && (
                <Flex direction="column" gap={16}>
                  <Title level={5}>
                    {t('connect-to-source-system-via-extractor', {
                      sourceSystem: sourceSystem.name,
                    })}
                  </Title>
                  <Flex direction="column" gap={16}>
                    {solutions.map((solution) => (
                      <SolutionForSourceSystem
                        key={solution.externalId}
                        {...solution}
                      />
                    ))}
                  </Flex>
                </Flex>
              )}
            </Flex>
            <aside>
              <Flex direction="column" gap={24}>
                {!!sourceSystem?.tags?.length && (
                  <>
                    <Title level="5">{t('tags')}</Title>
                    <StyledTagsContainer>
                      {sourceSystem.tags?.map((tag) => (
                        <Chip size="x-small" label={tag} key={tag} />
                      ))}
                    </StyledTagsContainer>
                  </>
                )}
              </Flex>
            </aside>
          </StyledLayoutGrid>
        </Layout.Container>
      </ContentContainer>
    </Layout>
  );
};

const StyledLayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 296px;
  gap: 56px;
`;

const StyledTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export default SourceSystemDetails;
