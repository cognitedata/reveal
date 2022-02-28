/* eslint-disable @cognite/no-number-z-index */
import { Divider } from '@cognite/data-exploration';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { AutoMLModel, AutoMLTrainingJob } from 'src/api/autoML/types';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';
import { PopulateCustomModel } from 'src/store/thunks/Process/PopulateCustomModel';
import { AutoMLModelPage } from './AutoMLPage/AutoMLModelPage';
import { AutoMLModelList } from './AutoMLModelList';
import { AutoMLPredictionDocModal } from './AutoMLPredictionDocModal';

const AutoML = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedModelId, setSelectedModelId] = useState<number>();
  const [downloadingModel, setDownloadingModel] = useState<boolean>(false);
  const [showApiDocModal, setShowApiDocModal] = useState<boolean>(false);

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

  const handleOnContextualize = (model: AutoMLTrainingJob | undefined) => {
    if (model) {
      dispatch(PopulateCustomModel(model));
      history.push(getLink(workflowRoutes.process));
    }
  };

  const handleOnGetPredictionURL = () => {
    setShowApiDocModal(true);
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
            handleOnContextualize={handleOnContextualize}
            handleOnGetPredictionURL={handleOnGetPredictionURL}
          />
        </Right>
        {showApiDocModal && (
          <AutoMLPredictionDocModal
            selectedModelId={selectedModelId}
            showModal={showApiDocModal}
            onCancel={() => {
              setShowApiDocModal(false);
            }}
          />
        )}
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
