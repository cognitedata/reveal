import React, { useState, useEffect } from 'react';
import { Body, Button, Icon, Title, toast } from '@cognite/cogs.js';
import { FileInfo as File } from '@cognite/sdk';
import { FileViewer } from 'components/FileViewer';
import { FileList } from 'components/FileList';
import { useAsset } from 'hooks/api';
import { useHistory, useParams } from 'react-router-dom';
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

export const FileView = () => {
  const { chartId, assetId } = useParams<{
    chartId: string;
    assetId: string;
  }>();

  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();

  const { data: chart } = useChart(chartId);
  const { data: asset, isFetched } = useAsset(Number(assetId));

  const {
    mutateAsync: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!');
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2));
    }
  }, [updateError, updateErrorMsg]);

  if (!isFetched) {
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
            onClick={() =>
              history.push({
                pathname: `/${chartId}`,
                search: history.location.search,
              })
            }
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
          <FileViewer file={selectedFile} />
          <div style={{ width: '100%' }}>
            <SourceTableWrapper>
              <SourceTable>
                <thead>{sourceTableHeaderRow}</thead>
                <tbody>
                  <TimeSeriesRows
                    chart={chart}
                    updateChart={updateChart}
                    mode="file"
                  />
                </tbody>
              </SourceTable>
            </SourceTableWrapper>
          </div>
        </SplitPaneLayout>
      </FileViewerContainer>
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
  padding: 20px;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;
