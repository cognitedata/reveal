import { useState, useEffect } from 'react';
import { Body, Button, Icon, Title, toast } from '@cognite/cogs.js';
import { Asset, FileInfo as File } from '@cognite/sdk';
import { FileViewer } from 'components/FileViewer';
import { FileList } from 'components/FileList';
import { useNavigate } from 'hooks';
import { useAsset } from 'hooks/api';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import {
  SourceTableWrapper,
  SourceTable,
  SourceItem,
  SourceName,
} from 'pages/ChartView/elements';
import { useChart, useUpdateChart } from 'hooks/firebase';
import TimeSeriesRows from 'pages/ChartView/TimeSeriesRows';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import Layers from 'utils/z-index';
import AssetSearchHit from 'components/SearchResultTable/AssetSearchHit';
import { trackUsage } from 'utils/metrics';

export const FileView = () => {
  const { chartId, assetId } = useParams<{
    chartId: string;
    assetId: string;
  }>();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [showLinkedAssets, setShowLinkedAssets] = useState<boolean>(false);
  const move = useNavigate();

  const { data: chart } = useChart(chartId);
  const { data: asset, isFetched: isAssetFetched } = useAsset(Number(assetId));
  const { data: linkedAssets = [] } = useCdfItems<Asset>(
    'assets',
    selectedFile?.assetIds?.map((id) => ({ id })) || [],
    {
      enabled:
        !!selectedFile &&
        selectedFile?.assetIds &&
        selectedFile?.assetIds?.length > 0,
    }
  );

  const {
    mutateAsync: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  useEffect(() => {
    trackUsage('PageView.FileView');
  }, []);

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!', { toastId: 'update-chart' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'update-chart',
      });
    }
  }, [updateError, updateErrorMsg]);

  if (!isAssetFetched) {
    return <Icon type="Loading" />;
  }

  if (!asset) {
    return <>Asset not found!</>;
  }

  if (!chart) {
    return <>Chart not found!</>;
  }

  const sourceTableHeaderRow = (
    <tr>
      <th style={{ width: 350 }}>
        <SourceItem>
          <SourceName>
            <Icon
              type="Eye"
              style={{
                marginLeft: 7,
                marginRight: 20,
                verticalAlign: 'middle',
              }}
            />
            Name
          </SourceName>
        </SourceItem>
      </th>
      <th>
        <SourceItem>
          <SourceName>Description</SourceName>
        </SourceItem>
      </th>
      <th style={{ width: 210 }}>
        <SourceItem>
          <SourceName>Tag</SourceName>
        </SourceItem>
      </th>
      <th style={{ width: 50, paddingLeft: 0 }}>
        <SourceItem style={{ justifyContent: 'center' }}>
          <SourceName>P&amp;IDs</SourceName>
        </SourceItem>
      </th>
      <th style={{ width: 50, paddingLeft: 0 }}>
        <SourceItem style={{ justifyContent: 'center' }}>
          <SourceName>Remove</SourceName>
        </SourceItem>
      </th>
    </tr>
  );

  return (
    <FileViewContainer>
      <FileSidebar>
        <Header>
          <Button
            icon="ArrowBack"
            style={{ marginBottom: 20 }}
            onClick={() => move(`/${chartId}`)}
          >
            Back to chart
          </Button>
          <Title level={4}>{asset.name}</Title>
          <Body level={2}>{asset.description}</Body>
        </Header>
        <FileList
          asset={asset}
          selectedFileId={selectedFile?.id}
          onFileClick={(file: File) => setSelectedFile(file)}
        />
      </FileSidebar>
      <FileViewerContainer>
        <SplitPaneLayout defaultSize={250}>
          <div style={{ width: '100%', height: '100%' }}>
            <FileViewer file={selectedFile} />
            {linkedAssets.length > 0 && (
              <Button
                style={{
                  position: 'absolute',
                  top: 25,
                  left: 20,
                  zIndex: Layers.MAXIMUM,
                }}
                onClick={() => setShowLinkedAssets(!showLinkedAssets)}
              >
                {`${showLinkedAssets ? 'Hide' : 'Show'} linked assets (${
                  linkedAssets.length
                })`}
              </Button>
            )}
          </div>
          <div style={{ width: '100%' }}>
            <SourceTableWrapper>
              <SourceTable>
                <thead>{sourceTableHeaderRow}</thead>
                <tbody>
                  <TimeSeriesRows
                    chart={chart}
                    updateChart={updateChart}
                    mode="file"
                    dateFrom={chart.dateFrom}
                    dateTo={chart.dateTo}
                  />
                </tbody>
              </SourceTable>
            </SourceTableWrapper>
          </div>
        </SplitPaneLayout>
      </FileViewerContainer>
      {showLinkedAssets && (
        <FileSidebar style={{ width: '30%' }}>
          <Header>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title level={4}>Linked assets</Title>
              <Button
                type="ghost"
                icon="Close"
                onClick={() => setShowLinkedAssets(false)}
              />
            </div>
          </Header>
          <LinkedAssetList>
            {linkedAssets.map((linkedAsset) => (
              <AssetSearchHit asset={linkedAsset} />
            ))}
          </LinkedAssetList>
        </FileSidebar>
      )}
    </FileViewContainer>
  );
};

const FileViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const FileSidebar = styled.div`
  width: 25%;
  height: 100%;
  border-left: 1px solid var(--cogs-greyscale-grey3);
  border-right: 1px solid var(--cogs-greyscale-grey3);
  display: flex;
  flex-direction: column;
`;

const LinkedAssetList = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 5px;
`;

const FileViewerContainer = styled.div`
  width: 75%;
  height: 100%;
  position: relative;
  display: flex;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;
