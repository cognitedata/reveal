import {
  Documentation,
  DataSet,
  ContentView,
  NoDataText,
  isNotNilOrWhitespace,
  OverviewWrapper,
} from 'utils';
import {
  Body,
  Colors,
  Elevations,
  Flex,
  Graphic,
  Icon,
  Title,
} from '@cognite/cogs.js';
import Card from 'antd/lib/card';

import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { useTranslation } from 'common/i18n';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface DocumentationsTabProps {
  dataSet?: DataSet;
}

const getDownloadUrl = async (fileId: number) => {
  const links = await sdk.files.getDownloadUrls([{ id: fileId }]);
  trackEvent('DataSets,LineageFlow.Downloaded documentation file');
  if (links.length === 0) {
    return null;
  }
  return links[0].downloadUrl;
};

const fileIcon = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  const ext = fileName.substring(dotIndex);
  switch (ext) {
    case '.png' || '.jpg' || '.jpeg': {
      return <Graphic type="Image" />;
    }
    case '.7z' || '.zip' || '.rpm' || '.tar.gz' || '.z': {
      return <Graphic type="Archive" />;
    }
    case '.csv': {
      return <Graphic type="CSV" />;
    }
    case '.pdf': {
      return <Graphic type="PDF" />;
    }
    case '.exe' ||
      '.py' ||
      '.bat' ||
      '.msi' ||
      '.pl' ||
      '.cgi' ||
      '.json' ||
      '.js': {
      return <Graphic type="Code" />;
    }
    default: {
      return <Graphic type="XSN" />;
    }
  }
};

const renderDocumenation = (documentation: Documentation) => {
  if (documentation.type === 'url') {
    return (
      <StyledLinkContainer
        key={documentation.name}
        to={documentation.id}
        target="_blank"
      >
        <StyledLink gap={12} justifyContent="space-between">
          <Body level={5}>{documentation.name || documentation.id}</Body>
          <Icon type="ExternalLink" />
        </StyledLink>
      </StyledLinkContainer>
    );
  }

  return (
    <StyledFileContainer
      direction="column"
      justifyContent="space-between"
      alignItems="flex-start"
      role="button"
      onClick={async () => {
        const url = await getDownloadUrl(Number(documentation.id));
        if (url) window.open(url);
      }}
    >
      <Flex className="file-icon">{fileIcon(documentation.name)}</Flex>
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        className="file-name"
      >
        {documentation.name || ''}
      </Flex>
    </StyledFileContainer>
  );
};

const DocumentationsTab = ({ dataSet }: DocumentationsTabProps) => {
  const { t } = useTranslation();
  const files = Array.isArray(dataSet?.metadata?.consoleAdditionalDocs)
    ? dataSet?.metadata?.consoleAdditionalDocs?.filter(
        (doc) => doc.type !== 'url'
      )
    : [];
  const links = Array.isArray(dataSet?.metadata?.consoleAdditionalDocs)
    ? dataSet?.metadata?.consoleAdditionalDocs?.filter(
        (doc) => doc.type === 'url' && isNotNilOrWhitespace(doc.id)
      )
    : [];

  return (
    <OverviewWrapper className="overview-wrapper">
      <ContentView>
        {dataSet?.metadata && (
          <Flex direction="column" gap={24}>
            <Card>
              <Flex
                justifyContent="flex-start"
                gap={24}
                style={{ padding: 24 }}
              >
                <Title level={4}>{t('files')}</Title>
                <Flex direction="row" gap={12} wrap="wrap">
                  {files?.length ? (
                    files.map((doc) => renderDocumenation(doc))
                  ) : (
                    <NoDataText>
                      {t('no-documentation-files-uploaded')}
                    </NoDataText>
                  )}
                  {files?.length ? (
                    files.map((doc) => renderDocumenation(doc))
                  ) : (
                    <NoDataText>
                      {t('no-documentation-files-uploaded')}
                    </NoDataText>
                  )}
                </Flex>
              </Flex>
            </Card>
            <Card>
              <Flex
                justifyContent="flex-start"
                gap={24}
                style={{ padding: 24 }}
              >
                <Title level={4}>{t('links')}</Title>
                <Flex gap={12} direction="column" style={{ width: '100%' }}>
                  {links?.length ? (
                    links.map((doc) => renderDocumenation(doc))
                  ) : (
                    <NoDataText>{t('no-documentation-links')}</NoDataText>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Flex>
        )}
      </ContentView>
    </OverviewWrapper>
  );
};

const StyledFileContainer = styled(Flex)`
  padding: 10px;
  width: 200px;
  height: 170px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }

  .file-icon {
    padding: 6px;
  }

  .file-name {
    width: inherit;
    text-overflow: ellipsis;
    overflow: hidden;

    display: -webkit-box !important;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
`;

const StyledLinkContainer = styled(Link)`
  height: 48px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 500ms ease;

  &:hover {
    background-color: white;
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }
`;

const StyledLink = styled(Flex)`
  padding: 12px 16px;
`;

export default DocumentationsTab;
