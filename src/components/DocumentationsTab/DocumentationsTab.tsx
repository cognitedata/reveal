import {
  LineageSubTitle,
  ContentView,
  NoDataText,
} from 'utils/styledComponents';
import { Button, Graphic, Icon } from '@cognite/cogs.js';
import Spin from 'antd/lib/spin';

import { Documentation, DataSet } from 'utils/types';
import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { isNotNilOrWhitespace } from 'utils/shared';
import { TitleOrnament, MiniInfoTitle } from '../../utils/styledComponents';

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
    case '.png' || '.jpg': {
      return <Graphic type="Image" />;
    }
    case '.7z' || '.zip' || '.rpm' || '.tar.gz' || '.z': {
      return <Graphic type="Archive" />;
    }
    case '.csv': {
      return <Graphic type="CSV" />;
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
      <LineageSubTitle>
        <a
          href={`${documentation.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon type="ExternalLink" /> {documentation.name || documentation.id}
        </a>
      </LineageSubTitle>
    );
  }
  return (
    <LineageSubTitle>
      <Button
        type="link"
        onClick={async () => {
          const url = await getDownloadUrl(Number(documentation.id));
          if (url) {
            window.open(url);
          }
        }}
      >
        {fileIcon(documentation.name)} {documentation.name || ''}
      </Button>
    </LineageSubTitle>
  );
};

const DocumentationsTab = ({ dataSet }: DocumentationsTabProps) => {
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

  if (dataSet?.metadata) {
    return (
      <ContentView>
        <MiniInfoTitle>Files</MiniInfoTitle>
        <TitleOrnament />
        {files?.length ? (
          files.map((doc) => renderDocumenation(doc))
        ) : (
          <NoDataText>No documentation files uploaded </NoDataText>
        )}

        <MiniInfoTitle>Links</MiniInfoTitle>
        <TitleOrnament />
        {links?.length ? (
          links.map((doc) => renderDocumenation(doc))
        ) : (
          <NoDataText>No documentation links</NoDataText>
        )}
      </ContentView>
    );
  }
  return (
    <ContentView>
      <Spin />
    </ContentView>
  );
};

export default DocumentationsTab;
