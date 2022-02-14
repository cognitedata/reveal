/* eslint-disable @cognite/no-number-z-index */
import { Divider } from '@cognite/data-exploration';
import React, { useState } from 'react';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { AutoMLModelPage } from './AutoMLPage/AutoMLModelPage';
import { AutoMLModelList } from './AutoMLModelList';

const AutoML = () => {
  const [selectedModelId, setSelectedModelId] = useState<number>();
  const [downloadingModel, setDownloadingModel] = useState<boolean>(false);

  const handleDownload = async () => {
    if (selectedModelId) {
      setDownloadingModel(true);
      const data = await AutoMLAPI.downloadAutoMLModel(selectedModelId);
      if (data?.modelUrl) {
        const res = await fetch(data.modelUrl, {
          method: 'GET',
        });
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${selectedModelId}.tflite`);
        document.body.appendChild(link);
        link.click();
      }
      setDownloadingModel(false);
    }
  };

  const onRowClick = (id: number) => {
    setSelectedModelId(id);
  };
  return (
    <>
      <StatusToolBar current="Computer Vision Models" />
      <Container>
        <Left>
          <AutoMLModelList
            onRowClick={onRowClick}
            selectedModelId={selectedModelId}
          />
          <Divider.Vertical style={{ height: '100%', width: '1px' }} />
        </Left>
        <Right>
          <AutoMLModelPage
            selectedModelId={selectedModelId}
            handleDownload={handleDownload}
            downloadingModel={downloadingModel}
          />
        </Right>
      </Container>
    </>
  );
};

export default AutoML;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 40px);
  background: #fff;
  overflow: hidden;
`;

const Left = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 20px;
`;

const Right = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  padding: 10px;
`;
