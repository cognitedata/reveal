import { Button, Collapse, Icon, Title, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import IconContainer from 'components/icons';
import Loading from 'components/utils/Loading';
import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import { useDocumentDownloadUrl } from 'hooks/useQuery/useDocumentDownloadUrl';
import useTimeSeriesQuery from 'hooks/useQuery/useTimeSeriesListQuery';
import noop from 'lodash/noop';
import { NavLink, useLocation } from 'react-router-dom';

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
  onSelect?: () => void; // select asset or timeserie
  onExpandDocument?: () => void; // show expand btn & handle onclick
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
  onExpandDocument,
  onSelect = noop,
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

  const location = useLocation();

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
            <DocumentPreview document={document} onClick={onExpandDocument} />
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
        {onExpandDocument && (
          <Button
            size="small"
            type="secondary"
            className="share sidebar-action-btn"
            onClick={onExpandDocument}
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
                        onClick={onSelect}
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
                        to={`${location.pathname}?fullscreen&tsid=${timeserie.id}`}
                        onClick={onSelect}
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
