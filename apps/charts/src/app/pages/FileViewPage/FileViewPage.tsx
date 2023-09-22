import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FileList } from '@charts-app/components/FileList/FileList';
import { FileViewer } from '@charts-app/components/FileViewer/FileViewer';
import SplitPaneLayout from '@charts-app/components/Layout/SplitPaneLayout';
import SourceTable from '@charts-app/components/SourceTable/SourceTable';
import { SourceTableHeader } from '@charts-app/components/SourceTable/SourceTableHeader';
import ConnectedLinkedAssetsSidebar from '@charts-app/containers/LinkedAssetsSidebar/ConnectedLinkedAssetsSidebar';
import { useAsset } from '@charts-app/hooks/cdf-assets';
import { useTranslations } from '@charts-app/hooks/translations';
import { calculationSummaries } from '@charts-app/models/calculation-results/selectors';
import chartAtom from '@charts-app/models/chart/atom';
import { useChartSourcesValue } from '@charts-app/models/chart/selectors';
import { removeSource } from '@charts-app/models/chart/updates';
import { timeseriesSummaries } from '@charts-app/models/timeseries-results/selectors';
import { useInitializedChart } from '@charts-app/pages/ChartViewPage/hooks';
import { trackUsage } from '@charts-app/services/metrics';
import { createInternalLink } from '@charts-app/utils/link';
import Layers from '@charts-app/utils/z-index';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components/macro';

import { ChartSource } from '@cognite/charts-lib';
import { Body, Button, Loader, Heading, Icon } from '@cognite/cogs.js';
import { Asset, FileInfo as File } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

const FileViewPage = () => {
  const { chartId = '', assetId } = useParams<{
    chartId: string;
    assetId: string;
  }>();
  const { data: chart } = useInitializedChart(chartId);
  const [, setChart] = useRecoilState(chartAtom);

  const handleRemoveSourceClick = (source: ChartSource) => () =>
    setChart((oldChart) => removeSource(oldChart!, source.id));

  const sources = useChartSourcesValue();

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
    !!(
      selectedFile &&
      selectedFile?.assetIds &&
      selectedFile?.assetIds?.length > 0
    )
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
            onClick={() => move(createInternalLink(chartId))}
          >
            {t['Back to chart']}
          </Button>
          <Heading level={4}>{asset.name}</Heading>
          <Body size="medium">{asset.description}</Body>
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
            {selectedFile ? (
              <FileViewer key={selectedFile.id} file={selectedFile} />
            ) : (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <Icon type="Loader" />
              </div>
            )}
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
              onRemoveSourceClick={handleRemoveSourceClick}
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
