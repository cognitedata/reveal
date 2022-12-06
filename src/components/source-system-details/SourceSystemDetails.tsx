import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Body, Flex, Loader, Title } from '@cognite/cogs.js';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { ContentContainer } from 'components/ContentContainer';
import { useSourceSystems } from 'hooks/useSourceSystems';
import { useSolutionsForSourceSystem } from 'hooks/useSolutions';
import { useTranslation } from 'common';
import ReactMarkdown from 'react-markdown';
import Solution from 'components/solution/Solution';

const SourceSystemDetails = () => {
  const { t } = useTranslation();

  const { sourceSystemExternalId } = useParams<{
    sourceSystemExternalId?: string;
  }>();

  const { data, status } = useSourceSystems();

  const { data: solutions } = useSolutionsForSourceSystem(
    sourceSystemExternalId ?? ''
  );

  const sourceSystem = data?.find(
    (item) => item.externalId === sourceSystemExternalId
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
                      <Solution key={solution.externalId} {...solution} />
                    ))}
                  </Flex>
                </Flex>
              )}
            </Flex>
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

export default SourceSystemDetails;
