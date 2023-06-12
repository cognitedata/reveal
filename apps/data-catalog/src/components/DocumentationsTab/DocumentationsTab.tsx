import styled from 'styled-components';
import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';

import {
  Body,
  Colors,
  Elevations,
  Flex,
  DocumentIcon,
  Icon,
  Title,
} from '@cognite/cogs.js';

import {
  Documentation,
  DataSet,
  NoDataText,
  isNotNilOrWhitespace,
  ContentWrapper,
  Card,
} from 'utils';
import { useTranslation } from 'common/i18n';

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

const getFileAttr = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  return {
    name: fileName.substring(0, dotIndex) || '',
    extention: fileName.substring(dotIndex) || '',
  };
};

const fileIcon = (fileName: string) => {
  const { extention } = getFileAttr(fileName);
  switch (extention) {
    case '.png' || '.jpg' || '.jpeg': {
      return <DocumentIcon file="png" />;
    }
    case '.7z' || '.zip' || '.rpm' || '.tar.gz' || '.z': {
      return <DocumentIcon file="zip" />;
    }
    case '.csv': {
      return <DocumentIcon file="csv" />;
    }
    case '.pdf': {
      return <DocumentIcon file="pdf" />;
    }
    case '.exe' ||
      '.py' ||
      '.bat' ||
      '.msi' ||
      '.pl' ||
      '.cgi' ||
      '.json' ||
      '.js': {
      return <DocumentIcon file="code" />;
    }
    default: {
      return <DocumentIcon file="xsn" />;
    }
  }
};

const renderDocumenation = (documentation: Documentation) => {
  if (documentation.type === 'url') {
    return (
      <StyledLinkContainer
        href={documentation.id}
        target="_blank"
        rel="noopener noreferrer"
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
        <Body level={2} strong className="name">
          {getFileAttr(documentation.name).name}
        </Body>
        <Body level={2} strong className="extention">
          {getFileAttr(documentation.name).extention}
        </Body>
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
    <ContentWrapper $backgroundColor="#FAFAFA">
      {dataSet?.metadata && (
        <Flex direction="column" gap={24}>
          <Card>
            <Flex justifyContent="flex-start" gap={24} style={{ padding: 24 }}>
              <Title level={4}>{t('files')}</Title>
              <Flex direction="row" gap={12} wrap="wrap">
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
            <Flex justifyContent="flex-start" gap={24} style={{ padding: 24 }}>
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
    </ContentWrapper>
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
    max-width: 179px;
    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
`;

const StyledLinkContainer = styled.a`
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
