import React, { useEffect } from 'react';
import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  useLocation,
} from 'react-router-dom';
import { Button, Icon } from '@cognite/cogs.js';
import {
  AssetBreadcrumb,
  Loader,
  ErrorFeedback,
  Wrapper,
  TimeseriesTable,
  Divider,
  SequenceTable,
  EventTable,
  FileTable,
  SpacedRow,
} from 'components/Common';
import { AssetTree } from '@cognite/gearbox/dist/components/AssetTree';
import { Asset } from 'cognite-sdk-v3';
import CdfCount from 'components/Common/atoms/CdfCount';

import { useResourcePreview } from 'context/ResourcePreviewContext';
import styled from 'styled-components';
import { useCdfItem } from 'hooks/sdk';
import AssetDetails from './AssetDetails';

type NavigationProps = {
  filter: any;
};

function Navigation({ filter }: NavigationProps) {
  const match = useRouteMatch();
  const location = useLocation();
  const activeTab = location.pathname.replace(match.url, '').slice(1);

  return (
    <SpacedRow key="assetNavitation">
      <Link to={`${match.url}/`}>
        <Button
          variant={activeTab === '' ? 'default' : 'ghost'}
          type={activeTab === '' ? 'primary' : 'secondary'}
        >
          Asset details
        </Button>
      </Link>
      <Link to={`${match.url}/timeseries`}>
        <Button
          variant={activeTab === 'timeseries' ? 'default' : 'ghost'}
          type={activeTab === 'timeseries' ? 'primary' : 'secondary'}
        >
          Linked time series (
          <CdfCount type="timeseries" filter={filter} />)
        </Button>
      </Link>
      <Link to={`${match.url}/files`}>
        <Button
          variant={activeTab === 'files' ? 'default' : 'ghost'}
          type={activeTab === 'files' ? 'primary' : 'secondary'}
        >
          Linked files (<CdfCount type="files" filter={filter} />)
        </Button>
      </Link>
      <Link to={`${match.url}/sequences`}>
        <Button
          variant={activeTab === 'sequences' ? 'default' : 'ghost'}
          type={activeTab === 'sequences' ? 'primary' : 'secondary'}
        >
          Linked sequences (<CdfCount type="sequences" filter={filter} />)
        </Button>
      </Link>
      <Link to={`${match.url}/events`}>
        <Button
          variant={activeTab === 'events' ? 'default' : 'ghost'}
          type={activeTab === 'events' ? 'primary' : 'secondary'}
        >
          Linked events (<CdfCount type="events" filter={filter} />)
        </Button>
      </Link>
      <Link to={`${match.url}/children`}>
        <Button
          variant={activeTab === 'children' ? 'default' : 'ghost'}
          type={activeTab === 'children' ? 'primary' : 'secondary'}
        >
          Children
        </Button>
      </Link>
    </SpacedRow>
  );
}

export const AssetPreview = ({
  assetId,
  extraActions,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
}) => {
  const match = useRouteMatch();
  const { openPreview, hidePreview } = useResourcePreview();

  const { data: asset, isFetched, error } = useCdfItem<Asset>(
    'assets',
    assetId,
    {
      enabled: !!assetId,
    }
  );

  const filter = { assetSubtreeIds: [{ id: assetId }] };
  // const files = unionBy(filesByAnnotations, filesByAssetId, el => el.id);

  useEffect(() => {
    if (assetId) {
      hidePreview();
    }
    return () => {
      hidePreview();
    };
  }, [hidePreview, assetId]);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  return (
    <Wrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <span style={{ marginRight: '12px' }}>LOCATION:</span>
        <AssetBreadcrumb
          assetId={assetId}
          onBreadcrumbClick={newAsset =>
            openPreview({
              item: { id: newAsset.id, type: 'asset' },
            })
          }
        />
      </div>
      <h1>
        <Icon type="DataStudio" /> {asset?.name}
      </h1>
      <SpacedRow>{extraActions}</SpacedRow>
      <Navigation filter={filter} />
      <Divider.Horizontal />
      <PreviewWrapper>
        <Switch>
          <Route exact path={`${match.path}/`}>
            <AssetDetails id={assetId} />;
          </Route>
          <Route path={`${match.path}/timeseries`}>
            <TimeseriesTable
              onTimeseriesClicked={ts => {
                if (ts) {
                  openPreview({
                    item: { id: ts.id, type: 'timeSeries' },
                  });
                }
              }}
              filter={filter}
            />
          </Route>
          <Route exact path={`${match.path}/files`}>
            <FileTable
              onFileClicked={file => {
                openPreview({
                  item: { id: file.id, type: 'file' },
                });
              }}
              filter={filter}
            />
          </Route>
          <Route exact path={`${match.path}/sequences`}>
            <SequenceTable
              onSequenceClicked={sequence => {
                openPreview({
                  item: { id: sequence.id, type: 'sequence' },
                });
              }}
              filter={filter}
            />
          </Route>
          <Route exact path={`${match.path}/events`}>
            <EventTable
              onEventClicked={event => {
                openPreview({
                  item: { id: event.id, type: 'event' },
                });
              }}
              filter={filter}
            />
          </Route>
          <Route exact path={`${match.path}/children`}>
            <AssetTree
              assetIds={[assetId]}
              defaultExpandedKeys={[assetId]}
              onSelect={newAsset => {
                if (newAsset.node) {
                  openPreview({
                    item: { id: newAsset.node!.id, type: 'asset' },
                  });
                }
              }}
            />
          </Route>
        </Switch>
      </PreviewWrapper>
    </Wrapper>
  );
};

const PreviewWrapper = styled.div`
  height: 100%;
`;
