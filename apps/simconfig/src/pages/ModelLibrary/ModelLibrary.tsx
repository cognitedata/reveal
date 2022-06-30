import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Input, Skeleton } from '@cognite/cogs.js';
import { useGetModelFileListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { ModelDetails, ModelList } from 'components/models';
import { capabilitiesSlice } from 'store/capabilities';
import { useAppDispatch } from 'store/hooks';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import { LabelsFilter } from './LabelsFilter';

import type { AppLocationGenerics } from 'routes';

export function ModelLibrary() {
  const dispatch = useAppDispatch();
  const project = useSelector(selectProject);
  const {
    data: { definitions },
    params: { modelName, simulator },
  } = useMatch<AppLocationGenerics>();
  const [modelNameFilter, setModelNameFilter] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<
    { label: string; value: string }[]
  >([]);
  const labelsFeature = definitions?.features.find(
    (feature) => feature.name === 'Labels'
  );
  const isLabelsEnabled = labelsFeature?.capabilities?.every(
    (capability) => capability.enabled
  );

  const [isModelFileDeleted, setIsModelFileDeleted] = useState<boolean>(false);
  const {
    data: modelFiles,
    isLoading: isLoadingModelFiles,
    refetch: refetchModelFiles,
  } = useGetModelFileListQuery(
    {
      project,
      labelIds: selectedLabels.map((label) => label.value).join(','),
    },
    { refetchOnMountOrArgChange: true }
  );
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      capabilitiesSlice.actions.setCapabilities({
        capabilities: definitions?.features,
      })
    );
  }, [definitions, dispatch]);

  const modelFileList = useMemo(
    () =>
      (modelFiles?.modelFileList ?? []).filter((modelFile) =>
        modelNameFilter
          ? modelFile.name.toLowerCase().includes(modelNameFilter)
          : true
      ),
    [modelFiles?.modelFileList, modelNameFilter]
  );

  const deleteHandleOnModelLibrary = () => {
    setIsModelFileDeleted(false);
    navigate({
      to: '/model-library/',
      replace: true,
    });
  };

  if (isLoadingModelFiles && !isModelFileDeleted) {
    return <Skeleton.List lines={5} />;
  }

  if (!modelName && modelFileList.length > 0) {
    const firstFile = modelFileList[0];
    navigate({
      to: `/model-library/models/${encodeURIComponent(
        firstFile.source
      )}/${encodeURIComponent(firstFile.metadata.modelName)}`,
      replace: true,
    });
  }

  return (
    <ModelLibraryContainer data-cy="model-library-container">
      <ModelLibrarySidebar>
        <div className="new-model">
          <Link to="/model-library/new-model">
            <Button
              icon="Add"
              type="secondary"
              block
              onClick={() => {
                trackUsage(TRACKING_EVENTS.NEW_MODEL, { simulator });
              }}
            >
              New model
            </Button>
          </Link>
        </div>
        <div className="header">
          <span className="header-title">Search models</span>
          <div className="form">
            <Input
              icon="Search"
              maxLength={64}
              name="modelName"
              placeholder="Filter by model name..."
              size="small"
              title=""
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setModelNameFilter(event.target.value.toLocaleLowerCase());
              }}
            />
            {isLabelsEnabled && (
              <LabelsFilter
                selectedLabels={selectedLabels}
                setSelectedLabels={setSelectedLabels}
              />
            )}
          </div>
        </div>
        <div className="model-list">
          <ModelList modelFiles={modelFileList} />
        </div>
      </ModelLibrarySidebar>
      <ModelLibraryContent>
        <ModelDetails
          modelLibraryDeleteHandler={deleteHandleOnModelLibrary}
          modelName={modelName}
          project={project}
          refetchModelFiles={refetchModelFiles}
          simulator={simulator}
        />
      </ModelLibraryContent>
    </ModelLibraryContainer>
  );
}

const ModelLibraryContainer = styled.div`
  display: flex;
  flex: 1 1 0;
  overflow: auto;
`;

const ModelLibrarySidebar = styled.aside`
  display: flex;
  flex-flow: column nowrap;
  flex: 0 1 auto;
  min-width: 400px;
  max-width: 400px;
  border-right: 1px solid #dddddd;
  .header {
    padding: 16px 24px 0px 24px;
    .header-title {
      font-weight: 600;
      font-size: 18px;
    }
    .form {
      font-size: var(--cogs-detail-font-size);
      .cogs-icon {
        width: 12px !important;
      }
      & > div {
        margin: 12px 0;
      }
    }
  }
  .new-model {
    padding: 20px 24px;
    background: var(--cogs-greyscale-grey1);
    width: 100%;
  }
  .model-list {
    padding: 24px;
    padding-top: 12px;
    overflow: auto;
  }
`;

const ModelLibraryContent = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
`;
