import { useState, useEffect } from 'react';
import { Button, Infobox, Loader } from '@cognite/cogs.js';
import { FileViewer } from 'components/FileViewer/FileViewer';
import { useAsset } from 'models/cdf/assets/queries/useAsset';
import styled from 'styled-components/macro';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import Layers from 'utils/z-index';
import { trackUsage } from 'services/metrics';
import { useTranslations } from 'hooks/translations';
import useInitializedChart from 'models/charts/chart/hooks/useInitializedChart';
import { useParams } from 'react-router-dom';
import ConnectedLinkedAssetsSidebar from 'containers/LinkedAssetsSidebar/ConnectedLinkedAssetsSidebar';
import ConnectedFileListSidebar from 'containers/FileListSidebar/ConnectedFileListSidebar';
import ConnectedFileViewSourceTable from 'containers/FileViewSourceTable/ConnectedFileViewSourceTable';
import useFile from 'models/cdf/files/queries/useFile';
import useAssets from 'models/cdf/assets/queries/useAssets';
import FileViewPageAppBar from './FileViewPageAppBar';

const translationKeys = [
  'Something went wrong',
  'Asset not found!',
  'Error while loading file viewer',
  'Back to chart',
  'Show',
  'Hide',
  'linked assets',
];

const FileViewPage = () => {
  const { chartId, assetId } =
    useParams<{ chartId: string; assetId: string }>();
  const [showLinkedAssets, setShowLinkedAssets] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number>();
  const { data: selectedFile, isLoading: isFileLoading } =
    useFile(selectedFileId);
  const { data: chart, isLoading: isChartLoading } =
    useInitializedChart(chartId);
  const {
    data: asset,
    isFetching: isAssetFetching,
    isError: isAssetFetchError,
  } = useAsset(assetId ? Number(assetId) : NaN);
  const { data: linkedAssets = [] } = useAssets(selectedFile?.assetIds ?? []);

  const { t } = useTranslations(translationKeys, 'FileView');

  const handleFileClick = (fileId: number) => setSelectedFileId(fileId);

  useEffect(() => {
    trackUsage('PageView.FileView');
  }, []);

  if (isAssetFetching || isChartLoading) {
    return <Loader darkMode={false} />;
  }

  if (isAssetFetchError) {
    return (
      <Infobox type="warning" title={t['Something went wrong']}>
        {t['Asset not found!']}
      </Infobox>
    );
  }

  if (!chart || !asset) {
    return (
      <Infobox type="warning" title={t['Something went wrong']}>
        {t['Error while loading file viewer']}
      </Infobox>
    );
  }

  return (
    <>
      <FileViewPageAppBar closeButtonText={t['Back to chart']} />
      <FileViewContainer>
        <ConnectedFileListSidebar
          asset={asset}
          onFileClick={handleFileClick}
          selectedFileId={selectedFileId}
        />
        <FileViewerContainer>
          <SplitPaneLayout defaultSize={250}>
            <div style={{ width: '100%', height: '100%' }}>
              {isFileLoading ? (
                <Loader darkMode={false} />
              ) : (
                <FileViewer file={selectedFile} />
              )}
              {linkedAssets.length > 0 && (
                <Button
                  style={{
                    position: 'absolute',
                    top: 25,
                    left: 20,
                    zIndex: Layers.MAXIMUM,
                  }}
                  onClick={() => {
                    setShowLinkedAssets(!showLinkedAssets);
                    setTimeout(
                      () => window.dispatchEvent(new Event('resize')),
                      1
                    );
                  }}
                >
                  {`${showLinkedAssets ? t.Hide : t.Show} ${
                    t['linked assets']
                  } (${linkedAssets.length})`}
                </Button>
              )}
            </div>
            <div style={{ width: '100%' }}>
              <ConnectedFileViewSourceTable />
            </div>
          </SplitPaneLayout>
        </FileViewerContainer>
        {showLinkedAssets && (
          <ConnectedLinkedAssetsSidebar
            chartId={chart.id}
            onClose={() => {
              setShowLinkedAssets(false);
              setTimeout(() => window.dispatchEvent(new Event('resize')), 1);
            }}
            assets={linkedAssets}
          />
        )}
      </FileViewContainer>
    </>
  );
};

const FileViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const FileViewerContainer = styled.div`
  flex-grow: 1;
  height: 100%;
  position: relative;
  display: flex;
`;

export default FileViewPage;
