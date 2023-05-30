import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { getProject } from '@cognite/cdf-utilities';
import { Button, Input, Skeleton } from '@cognite/cogs.js';
import { Illustrations, Pagination } from '@cognite/cogs.js-v9';
import { useSDK } from '@cognite/sdk-provider';
import { useGetModelFileListV2Query } from '@cognite/simconfig-api-sdk/rtk';

import { ModelDetails, ModelList } from 'components/models';
import { capabilitiesSlice } from 'store/capabilities';
import { selectIsLabelsEnabled } from 'store/capabilities/selectors';
import { useAppDispatch } from 'store/hooks';
import { createCdfLink } from 'utils/createCdfLink';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';
import {
  INITIAL_ITEMS_PER_PAGE,
  getTotalPages,
  paginateData,
} from 'utils/pagination';

import { LabelsFilter } from './LabelsFilter';

import type { AppLocationGenerics } from 'routes';

type ItemsPerPage = React.ComponentProps<typeof Pagination>['itemsPerPage'];

export function ModelLibrary() {
  const dispatch = useAppDispatch();
  const client = useSDK();
  const project = getProject();

  const {
    data: { definitions },
    params: { modelName, simulator },
  } = useMatch<AppLocationGenerics>();
  const [modelNameFilter, setModelNameFilter] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<
    { label: string; value: string }[]
  >([]);

  const isLabelsEnabled = useSelector(selectIsLabelsEnabled);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(
    INITIAL_ITEMS_PER_PAGE
  );

  const [isModelFileDeleted, setIsModelFileDeleted] = useState<boolean>(false);
  const {
    data: modelFiles,
    isLoading: isLoadingModelFiles,
    refetch: refetchModelFiles,
  } = useGetModelFileListV2Query(
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

  // Find the list of models
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
      to: createCdfLink('/model-library/'),
      replace: true,
    });
  };

  if (isLoadingModelFiles && !isModelFileDeleted) {
    return <Skeleton.List lines={5} />;
  }

  const isModalLibraryEmpty = modelFiles?.modelFileList.length === 0;

  if (!modelName && !isModalLibraryEmpty) {
    const firstFile = modelFileList[0];
    navigate({
      to: createCdfLink(
        `/model-library/models/${encodeURIComponent(
          firstFile.source
        )}/${encodeURIComponent(firstFile.metadata.modelName)}/`,
        client.getBaseUrl()
      ),
    });
  }

  const onPageChange = (page: number) => {
    setPageNumber(page);
  };

  const setItemPerPage = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage as ItemsPerPage);
  };

  const slicedModelFiles = paginateData(modelFileList, pageNumber);
  const totalPages = getTotalPages(modelFileList);

  return (
    <ModelLibraryContainer data-cy="model-library-container">
      <ModelLibrarySidebar>
        {!isModalLibraryEmpty && (
          <div className="new-model">
            <Link to={createCdfLink(`/model-library/new-model`)}>
              <Button
                icon="Add"
                style={{ width: '100%' }}
                type="secondary"
                block
                onClick={() => {
                  trackUsage(TRACKING_EVENTS.NEW_MODEL, { simulator });
                }}
              >
                Create model
              </Button>
            </Link>
          </div>
        )}
        <div className="header">
          <span className="header-title">Search models</span>
          <div className="form">
            <Input
              icon="Search"
              maxLength={64}
              name="modelName"
              placeholder="Find model name"
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
          <ModelList
            isModalLibraryEmpty={isModalLibraryEmpty}
            modelFiles={slicedModelFiles}
          />
        </div>
        <PaginationStyled
          itemsPerPage={itemsPerPage}
          setItemPerPage={setItemPerPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </ModelLibrarySidebar>
      <ModelLibraryContent>
        <ModelDetails
          modelLibraryDeleteHandler={deleteHandleOnModelLibrary}
          modelName={modelName}
          project={project}
          refetchModelFiles={refetchModelFiles}
          simulator={simulator}
        />
        {isModalLibraryEmpty && (
          <NoModelsContainer>
            <Illustrations.Solo type="Simulation" />
            <h5>No simulator models found</h5>
            <span>Create your first model to get started</span>
            <Link to={createCdfLink(`/model-library/new-model`)}>
              <Button icon="Add" type="primary">
                Create model
              </Button>
            </Link>
          </NoModelsContainer>
        )}
      </ModelLibraryContent>
    </ModelLibraryContainer>
  );
}

const PaginationStyled = styled(Pagination)`
  & {
    scale: 0.8;
    position: absolute;
    bottom: 0;
    padding-top: 10px;
    background: white;
    padding-bottom: 10px;
  }
`;

const ModelLibraryContainer = styled.div`
  display: flex;
  flex: 1 1 0;
  overflow: auto;
`;

const NoModelsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  height: 100%;

  h5 {
    font-size: var(--cogs-t5-font-size);
    margin: 0;
  }

  span {
    font-size: 12px;
    margin-bottom: 16px;
    margin-top: 8px;
  }
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
    padding-bottom: 0;
    overflow: auto;
    height: calc(100vh - 380px);
  }
`;

const ModelLibraryContent = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
`;
