import styled from 'styled-components';
import { HeaderContainer } from 'components/HeaderContainer';
import { Layout } from 'components/Layout';
import { useTranslation } from 'common';
import { Breadcrumb } from '@cognite/cdf-utilities';
import { useParams } from 'react-router-dom';
import { Body, Colors, Flex, Icon, Title } from '@cognite/cogs.js';
import { getReleaseVersionCore } from 'utils/utils';
import { ReleaseTag } from 'components/ReleaseTag';

type DetailsHeaderProps = {
  imageUrl?: string;
  title: string;
  version?: string;
  createdAt?: string;
};

const DetailsHeader = ({
  imageUrl,
  title,
  version,
  createdAt,
}: DetailsHeaderProps) => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{
    subAppPath?: string;
  }>();

  return (
    <HeaderContainer>
      <Layout.Container>
        <Flex gap={36} direction="column">
          <Breadcrumb
            items={[
              {
                path: `/${subAppPath}`,
                title: t('extract-data'),
              },
              {
                title,
              },
            ]}
          />
          <Flex direction="column" gap={16}>
            <Flex gap={8}>
              {imageUrl && (
                <StyledExtractorImageContainer>
                  <StyledExtractorImage src={imageUrl} />
                </StyledExtractorImageContainer>
              )}
              <Title level="3">{title}</Title>
            </Flex>
            {(version || createdAt) && (
              <Flex gap={12}>
                {version && (
                  <Flex gap={6} alignItems="center">
                    <StyledIconMuted type="Layers" />
                    <StyledBodyMuted>
                      <Flex gap={2}>
                        <Flex gap={6} alignItems="center">
                          {t('version-n', {
                            version: getReleaseVersionCore(version),
                          })}
                        </Flex>
                        <ReleaseTag version={version}></ReleaseTag>
                      </Flex>
                    </StyledBodyMuted>
                  </Flex>
                )}
                {createdAt && (
                  <Flex gap={6} alignItems="center">
                    <StyledIconMuted type="Events" />
                    <StyledBodyMuted>
                      {t('released-date', {
                        createdAt,
                      })}
                    </StyledBodyMuted>
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

const StyledBodyMuted = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted']};
`;

const StyledIconMuted = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;

const StyledExtractorImageContainer = styled.div`
  align-items: center;
  display: flex;
  height: 32px;
`;

const StyledExtractorImage = styled.img`
  max-height: 32px;
  max-width: 32px;
`;

export default DetailsHeader;
