import { Body, Button, Icon, Title } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import IconContainer from 'components/icons';
import Loading from 'components/utils/Loading';
import { useDocumentDownloadUrl } from 'hooks/useQuery/useDocumentDownloadUrl';

import DocumentPreview from '../DocumentPreview';
import ShareButton from '../ShareButton';

import {
  Actions,
  Container,
  Header,
  Metadata,
  MetadataItem,
  Preview,
} from './elements';

export type DocumentSidebarProps = {
  document: FileInfo;
};

const DocumentDownloadButton = ({ document }: { document: FileInfo }) => {
  const { data: downloadUrl, isLoading } = useDocumentDownloadUrl(document);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="cogs-btn cogs-btn-secondary cogs-btn-tiny cogs-btn-tiny--padding cogs-btn-icon-only"
      href={downloadUrl}
      download={`${document.name}.json`}
    >
      <Icon type="Download" />
    </a>
  );
};

const DocumentSidebar = ({ document }: DocumentSidebarProps) => {
  const handleOpenInBlueprint = () => {
    const url = `https://blueprint.cogniteapp.com`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      <Header>
        <IconContainer type="Document" />
        <Title level={5} className="document-sidebar--title">
          {document.name}
        </Title>
      </Header>
      <Preview>
        <div className="document-sidebar--preview-wrapper">
          <DocumentPreview document={document} />
        </div>
      </Preview>
      <Actions>
        <Button
          size="small"
          type="primary"
          icon="Image"
          className="documents-sidebar--open-in-blueprint"
          onClick={handleOpenInBlueprint}
        >
          Open in Blueprint
        </Button>
        <ShareButton />
        <DocumentDownloadButton document={document} />
      </Actions>
      <Metadata>
        <Body level={2} strong className="documents-sidebar--details">
          Details
        </Body>
        {Object.keys(document.metadata || {}).map((key) => (
          <MetadataItem key={key}>
            <span>{key}</span>
            <span>{document.metadata?.[key]}</span>
          </MetadataItem>
        ))}
      </Metadata>
    </Container>
  );
};

export default DocumentSidebar;
