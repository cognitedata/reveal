import { useState, useEffect } from 'react';
import { Body, Button, Loader, Title } from '@cognite/cogs.js';
import { Asset, FileInfo as File } from '@cognite/sdk';
import { FileViewer } from 'components/FileViewer/FileViewer';
import { FileList } from 'components/FileList/FileList';
import { useNavigate } from 'hooks/navigation';
import { useAsset } from 'hooks/cdf-assets';
import styled from 'styled-components/macro';
import SplitPaneLayout from 'components/Layout/SplitPaneLayout';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import Layers from 'utils/z-index';
import { trackUsage } from 'services/metrics';
import { SourceTableHeader } from 'components/SourceTable/SourceTableHeader';
import { useTranslations } from 'hooks/translations';
import SourceTable from 'components/SourceTable/SourceTable';
import { timeseriesSummaries } from 'models/charts/timeseries-results/selectors';
import { useRecoilValue } from 'recoil';
import { calculationSummaries } from 'models/calculation-backend/calculation-results/atom-selectors/selectors';
import { useInitializedChart } from 'pages/ChartViewPage/hooks';
import { useParams } from 'react-router-dom';
import { chartSources } from 'models/charts/charts/atom-selectors/selectors';
import ConnectedLinkedAssetsSidebar from 'containers/LinkedAssetsSidebar/ConnectedLinkedAssetsSidebar';

const FileViewPage = () => {
  const { chartId, assetId } =
    useParams<{ chartId: string; assetId: string }>();
  const { data: chart } = useInitializedChart(chartId);

  const sources = useRecoilValue(chartSources);

  const summaries = {
    ...useRecoilValue(timeseriesSummaries),
    ...useRecoilValue(calculationSummaries),
  };

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

  const { t } = useTranslations(
    [
      'Asset not found!',
      'Chart not found!',
      'Error while loading file viewer',
      'Back to chart',
      'Show',
      'Hide',
      'linked assets',
      'Linked assets',
      'Asset is loading, please wait',
    ],
    'FileView'
  );

  useEffect(() => {
    trackUsage('PageView.FileView');
  }, []);

  /**
   * Source Table Header translations
   */
  const { t: sourceTableHeaderTranslations } = useTranslations(
    SourceTableHeader.translationKeys,
    'SourceTableHeader'
  );

  if (!isAssetFetched) {
    return <Loader />;
  }

  if (!asset) {
    return (
      <NoChartBox>
        <h2>{t['Asset not found!']}</h2>
      </NoChartBox>
    );
  }

  if (!chart) {
    return (
      <NoChartBox>
        <h2>{t['Error while loading file viewer']}</h2>
      </NoChartBox>
    );
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
            {t['Back to chart']}
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
                {`${showLinkedAssets ? t.Hide : t.Show} ${
                  t['linked assets']
                } (${linkedAssets.length})`}
              </Button>
            )}
          </div>
          <div style={{ width: '100%' }}>
            <SourceTable
              mode="file"
              headerTranslations={sourceTableHeaderTranslations}
              sources={sources}
              summaries={summaries}
            />
          </div>
        </SplitPaneLayout>
      </FileViewerContainer>
      {showLinkedAssets && (
        <ConnectedLinkedAssetsSidebar
          chartId={chart.id}
          onClose={() => setShowLinkedAssets(false)}
          assets={linkedAssets}
        />
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

const FileViewerContainer = styled.div`
  width: 75%;
  height: 100%;
  position: relative;
  display: flex;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

const NoChartBox = styled.div`
  border: 1px solid var(--cogs-greyscale-grey3);
  padding: 1.5rem 1rem;
  width: calc(100% - 2rem);
  margin: 1rem 1rem auto;
  text-align: center;

  > h2 {
    margin: 0 0 2rem;
  }
`;

export default FileViewPage;
