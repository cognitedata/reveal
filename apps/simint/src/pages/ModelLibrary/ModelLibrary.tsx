import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { getProject } from '@cognite/cdf-utilities';
import { Button, Input, Pagination, Skeleton } from '@cognite/cogs.js';
import { useGetModelFileListV2Query } from '@cognite/simconfig-api-sdk/rtk';

import { ModelDetails, ModelList } from '../../components/models';
import { NoResults } from '../../components/shared/NoResults';
import type { AppLocationGenerics } from '../../routes';
import { capabilitiesSlice } from '../../store/capabilities';
import { selectIsLabelsEnabled } from '../../store/capabilities/selectors';
import { useAppDispatch } from '../../store/hooks';
import { selectBaseUrl } from '../../store/simconfigApiProperties/selectors';
import { createCdfLink } from '../../utils/createCdfLink';
import { TRACKING_EVENTS } from '../../utils/metrics/constants';
import { trackUsage } from '../../utils/metrics/tracking';
import {
  INITIAL_ITEMS_PER_PAGE,
  getTotalPages,
  paginateData,
} from '../../utils/pagination';

import { LabelsFilter } from './LabelsFilter';

const isModelActive = (modelName: string) => {
  const encodedModelName = encodeURIComponent(modelName);
  const path = window.location.pathname;
  return path.split('/').includes(encodedModelName);
};

type ItemsPerPage = React.ComponentProps<typeof Pagination>['itemsPerPage'];

export function ModelLibrary() {
  const dispatch = useAppDispatch();
  const baseUrl = useSelector(selectBaseUrl);
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
    [definitions?.simulatorsConfig, modelFiles?.modelFileList, modelNameFilter]
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
        baseUrl
      ),
    });
  }

  const onPageChange = (page: number) => {
    setPageNumber(page);
  };

  const setItemPerPage = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage as ItemsPerPage);
  };

  const slicedModelFiles = paginateData(modelFileList, pageNumber).map(
    (modelFile) => ({
      ...modelFile,
      isActive: isModelActive(modelFile.metadata.modelName),
      simulatorName:
        definitions?.simulatorsConfig?.filter(
          ({ key }) => key === modelFile.metadata.simulator
        )?.[0].name ?? modelFile.metadata.simulator,
    })
  );
  const totalPages = getTotalPages(modelFileList);

  return (
    <ModelLibraryContainer data-testid="model-library-container">
      <ModelLibrarySidebar>
        {!isModalLibraryEmpty && (
          <div className="new-model">
            <Link to={createCdfLink(`/model-library/new-model`)}>
              <Button
                icon="Add"
                data-testid="create-model-button"
                style={{ width: '100%' }}
                type="secondary"
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
        {!isModalLibraryEmpty && (
          <PaginationStyled
            itemsPerPage={itemsPerPage}
            setItemPerPage={setItemPerPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </ModelLibrarySidebar>
      <ModelLibraryContent>
        {!isModalLibraryEmpty && (
          <ModelDetails
            modelLibraryDeleteHandler={deleteHandleOnModelLibrary}
            modelName={modelName}
            project={project}
            refetchModelFiles={refetchModelFiles}
            simulator={simulator}
          />
        )}
        {isModalLibraryEmpty && (
          <NoResults
            bodyText="Create your first model to get started"
            headerText="No simulator models found"
            action={
              <Link to={createCdfLink(`/model-library/new-model`)}>
                <Button icon="Add" type="primary">
                  Create model
                </Button>
              </Link>
            }
          />
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
