import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Colors, Flex, Loader, Title } from '@cognite/cogs.js';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { ContentContainer } from 'components/ContentContainer';
import { useSourceSystems } from 'hooks/useSourceSystems';
import { useSolutionsForSourceSystem } from 'hooks/useSolutions';
import { useTranslation } from 'common';

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
            {sourceSystem?.name && !!solutions?.length && (
              <Flex direction="column" gap={16}>
                <Title level={5}>
                  {t('connect-to-source-system-with-colon', {
                    name: sourceSystem.name,
                  })}
                </Title>
                {solutions.map(({ name }) => (
                  <StyledExtractorLink>{name}</StyledExtractorLink>
                ))}
              </Flex>
            )}
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

const StyledExtractorLink = styled.div`
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  padding: 24px;
`;

export default SourceSystemDetails;
