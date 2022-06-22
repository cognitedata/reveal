/* eslint-disable @cognite/no-number-z-index */
import { Divider } from '@cognite/data-exploration';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import styled from 'styled-components';
import { AutoMLAPI } from 'src/api/vision/autoML/AutoMLAPI';
import {
  AutoMLExportFormat,
  AutoMLModelCore,
  AutoMLTrainingJob,
} from 'src/api/vision/autoML/types';
import { getLink, workflowRoutes } from 'src/utils/workflowRoutes';
import { PopulateCustomModel } from 'src/store/thunks/Process/PopulateCustomModel';
import { AutoMLModelPage } from './AutoMLPage/AutoMLModelPage';
import { AutoMLModelList } from './AutoMLModelList';
import { AutoMLPredictionDocModal } from './AutoMLPredictionDocModal';

const getModelTypeExtension = (exportFormat: AutoMLExportFormat) => {
  return exportFormat === AutoMLExportFormat.tflite ? exportFormat : 'pb';
};
const AutoML = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [modelList, setModelList] = useState<AutoMLModelCore[] | undefined>();
  const [jobs, setJobs] = useState<AutoMLTrainingJob[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number>();
  const [downloadingModel, setDownloadingModel] = useState<boolean>(false);
  const [showApiDocModal, setShowApiDocModal] = useState<boolean>(false);

  const getModels = async () => {
    const models = await AutoMLAPI.listAutoMLModels();
    setModelList(models);

    models.forEach((model) => {
      AutoMLAPI.getAutoMLModel(model.jobId).then((modelJob) => {
        setJobs((currentJobs) => [...currentJobs, modelJob]);
      });
    });
  };

  const handleDownload = async (exportFormat: AutoMLExportFormat) => {
    if (selectedModelId) {
      setDownloadingModel(true);
      const format = getModelTypeExtension(exportFormat);
      const data = await AutoMLAPI.downloadAutoMLModel(
        selectedModelId,
        exportFormat
      );
      if (data?.modelUrl) {
        const res = await fetch(data.modelUrl, {
          method: 'GET',
        });
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${selectedModelId}.${format}`);
        document.body.appendChild(link);
        link.click();
      }
      setDownloadingModel(false);
    }
  };

  const handleOnDelete = async () => {
    if (selectedModelId) {
      setSelectedModelId(undefined);
      setModelList(modelList?.filter((item) => item.jobId !== selectedModelId));
      setJobs(jobs?.filter((item) => item.jobId !== selectedModelId));
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

  const isLoadingJob =
    (selectedModelId && !jobs.find((item) => item.jobId === selectedModelId)) ||
    false;

  useEffect(() => {
    getModels();
  }, []);

  return (
    <>
      <StatusToolBar current="Computer Vision Models" />
      <Container>
        <Left>
          <AutoMLModelList
            jobs={jobs}
            modelList={modelList}
            onRowClick={onRowClick}
            selectedModelId={selectedModelId}
          />
          <Divider.Vertical style={{ height: '100%', width: '1px' }} />
        </Left>
        <Right>
          <AutoMLModelPage
            model={jobs.find((item) => item.jobId === selectedModelId)}
            isLoadingJob={isLoadingJob}
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
