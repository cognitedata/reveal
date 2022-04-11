import { Button, Collapse, Icon, Title, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import IconContainer from 'components/icons';
import Loading from 'components/utils/Loading';
import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import { useDocumentDownloadUrl } from 'hooks/useQuery/useDocumentDownloadUrl';
import useTimeSeriesQuery from 'hooks/useQuery/useTimeSeriesListQuery';
import noop from 'lodash/noop';
import { NavLink } from 'react-router-dom';

import DocumentPreview from '../DocumentPreview';
import ShareButton from '../ShareButton';

import {
  Actions,
  Container,
  Header,
  Metadata,
  MetadataItem,
  Preview,
  DocumentDetailsContainer,
} from './elements';

export type DocumentSidebarProps = {
  document: FileInfo;
  showPreview?: boolean;
  showHeader?: boolean;
  handleSelect?: () => void; // select asset or timeserie
  handleExpandDocument?: () => void; // show expand btn & handle click on it
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

const DocumentSidebar = ({
  document,
  showPreview = true,
  showHeader = true,
  handleExpandDocument,
  handleSelect = noop,
}: DocumentSidebarProps) => {
  const handleOpenInBlueprint = () => {
    const url = `https://blueprint.cogniteapp.com`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const assetRetrieveQuery = useAssetRetrieveQuery(
    document.assetIds?.map((id) => ({ id }))
  );
  const timeseriesQuery = useTimeSeriesQuery(
    document.assetIds?.length
      ? {
          filter: { assetIds: document.assetIds },
        }
      : undefined
  );

  return (
    <Container>
      {showHeader && (
        <Header>
          <IconContainer type="Document" />
          <Title level={5} className="document-sidebar--title">
            {document.name}
          </Title>
        </Header>
      )}
      {showPreview && (
        <Preview>
          <div className="document-sidebar--preview-wrapper">
            <DocumentPreview
              document={document}
              handleClick={handleExpandDocument}
            />
          </div>
        </Preview>
      )}
      <Actions>
        <Button
          size="small"
          type="primary"
          icon="Image"
          className="documents-sidebar--open-in-blueprint sidebar-action-btn"
          onClick={handleOpenInBlueprint}
        >
          Open in Blueprint
        </Button>
        {handleExpandDocument && (
          <Button
            size="small"
            type="secondary"
            className="share sidebar-action-btn"
            onClick={handleExpandDocument}
          >
            <Icon type="Expand" />
          </Button>
        )}
        <ShareButton className="sidebar-action-btn" />
        <DocumentDownloadButton document={document} />
      </Actions>
      <DocumentDetailsContainer>
        {assetRetrieveQuery.data?.length ? (
          <Collapse accordion ghost>
            <Collapse.Panel
              header={`Assets (${assetRetrieveQuery.data.length})`}
              key="sidebar-assets"
              className="sidebar-details-collapsable"
            >
              <ul>
                {assetRetrieveQuery.data.map((asset) => (
                  <Tooltip content={asset.name} key={`sidebar-${asset.id}`}>
                    <li>
                      <NavLink
                        to={`/explore/${asset.id}/detail`}
                        onClick={handleSelect}
                      >
                        {asset.name}
                      </NavLink>
                    </li>
                  </Tooltip>
                ))}
              </ul>
            </Collapse.Panel>
          </Collapse>
        ) : null}
        {timeseriesQuery.data?.length ? (
          <Collapse accordion ghost>
            <Collapse.Panel
              header={`Timeseries (${timeseriesQuery.data.length})`}
              key="sidebar-timeseries"
              className="sidebar-details-collapsable"
            >
              <ul>
                {timeseriesQuery.data.map((timeserie) => (
                  <Tooltip
                    content={timeserie.name}
                    key={`sidebar-${timeserie.id}`}
                  >
                    <li>
                      <NavLink
                        to={`/explore/${
                          timeserie.assetId
                        }/timeseries?q=${encodeURI(timeserie.name || '')}`}
                        onClick={handleSelect}
                      >
                        {timeserie.name}
                      </NavLink>
                    </li>
                  </Tooltip>
                ))}
              </ul>
            </Collapse.Panel>
          </Collapse>
        ) : null}
      </DocumentDetailsContainer>
      <Metadata>
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
