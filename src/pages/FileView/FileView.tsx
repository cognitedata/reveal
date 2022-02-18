import { useState, useEffect } from 'react';
import { Body, Button, Icon, Title } from '@cognite/cogs.js';
import { Asset, FileInfo as File } from '@cognite/sdk';
import { FileViewer } from 'components/FileViewer';
import { FileList } from 'components/FileList';
import { useNavigate } from 'hooks/navigation';
import { useAsset } from 'hooks/cdf-assets';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import { SourceTableWrapper, SourceTable } from 'pages/ChartView/elements';
import TimeSeriesRows from 'pages/ChartView/TimeSeriesRows';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import Layers from 'utils/z-index';
import AssetSearchHit from 'components/SearchResultTable/AssetSearchHit';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';

export const FileView = () => {
  const [chart, setChart] = useRecoilState(chartAtom);

  const { chartId, assetId } = useParams<{
    chartId: string;
    assetId: string;
  }>();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [showLinkedAssets, setShowLinkedAssets] = useState(false);
  const move = useNavigate();

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

  useEffect(() => {
    trackUsage('PageView.FileView');
  }, []);

  if (!isAssetFetched) {
    return <Icon type="Loader" />;
  }

  if (!asset) {
    return <>Asset not found!</>;
  }

  if (!chart) {
    return <>Chart not found!</>;
  }

  return (
    <FileViewContainer>
      <FileSidebar>
        <Header>
          <Button
            icon="ArrowLeft"
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
                <SourceTableHeader mode="file" />
                <tbody>
                  <TimeSeriesRows
                    chart={chart}
                    updateChart={setChart}
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
