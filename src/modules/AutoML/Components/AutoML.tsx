/* eslint-disable @cognite/no-number-z-index */
import { Divider } from '@cognite/data-exploration';
import React, { useEffect, useState } from 'react';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { AutoMLModel } from 'src/api/autoML/types';
import { AutoMLModelPage } from './AutoMLPage/AutoMLModelPage';
import { AutoMLModelList } from './AutoMLModelList';

const AutoML = () => {
  const [selectedModelId, setSelectedModelId] = useState<number>();
  const [downloadingModel, setDownloadingModel] = useState<boolean>(false);

  const [models, setModels] = useState<AutoMLModel[] | undefined>();

  const getModels = async () => {
    const items = await AutoMLAPI.listAutoMLModels();
    setModels(items);
  };

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

  const handleOnDelete = async () => {
    if (selectedModelId) {
      setSelectedModelId(undefined);
      setModels(models?.filter((item) => item.jobId !== selectedModelId));
      const res = await AutoMLAPI.deleteAutoMLJob(selectedModelId);
      // revert, if request fails
      if (res === undefined) {
        setSelectedModelId(selectedModelId);
        getModels();
      }
    }
  };

  const onRowClick = (id: number) => {
    setSelectedModelId(id);
  };

  useEffect(() => {
    getModels();
  }, []);

  return (
    <>
      <StatusToolBar current="Computer Vision Models" />
      <Container>
        <Left>
          <AutoMLModelList
            models={models}
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
            handleOnDelete={handleOnDelete}
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
