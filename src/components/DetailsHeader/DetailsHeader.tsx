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
  version: string;
  createdAt: string;
};

const DetailsHeader = ({
  imageUrl,
  title,
  version,
  createdAt,
}: DetailsHeaderProps) => {
  const { t } = useTranslation();
  const { subAppPath, extractorExternalId } = useParams<{
    subAppPath?: string;
    extractorExternalId?: string;
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
                path: `/${subAppPath}/${extractorExternalId}`,
                title: title,
              },
            ]}
          />
          <Flex direction="column" gap={16}>
            {imageUrl && (
              <div>
                <img src={imageUrl} />
              </div>
            )}
            <Title level="3">{title}</Title>
            <Flex gap={12}>
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
              <Flex gap={6} alignItems="center">
                <StyledIconMuted type="Events" />
                <StyledBodyMuted>
                  {t('released-date', {
                    createdAt,
                  })}
                </StyledBodyMuted>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

export default DetailsHeader;

const StyledBodyMuted = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted']};
`;

const StyledIconMuted = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;
