import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Input } from '@cognite/cogs.js';
import type { GetModelFileApiResponse } from '@cognite/simconfig-api-sdk/rtk';
import { useGetModelFileListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { ModelDetails, ModelList } from 'components/models';
import { selectProject } from 'store/simconfigApiProperties/selectors';

import type { AppLocationGenerics } from 'routes';

export function ModelLibrary() {
  const project = useSelector(selectProject);
  const {
    params: {
      modelName,
      simulator = 'UNKNOWN',
      selectedTab = 'model-versions',
    },
  } = useMatch<AppLocationGenerics>();

  const [modelFilesList, setModelFileslist] = useState<
    GetModelFileApiResponse[]
  >([]);
  const navigate = useNavigate();

  const {
    data: modelFiles,
    isFetching: isFetchingModelFiles
  } = useGetModelFileListQuery({ project });

  if (!modelName && modelFilesList.length) {
    const firstFile = modelFilesList[0];
    navigate({
      to: `/model-library/models/${encodeURIComponent(
        firstFile.source
      )}/${encodeURIComponent(firstFile.metadata.modelName)}`,
      replace: true,
    });
  }

  useEffect(() => {
    setModelFileslist(modelFiles?.modelFileList ?? []);
  }, [modelFiles])

  const handleOnModelNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;
    const modelFileList = modelFiles?.modelFileList ?? [];

    if (!searchText) {
      // Load complete list if the user has cleared the search box
      setModelFileslist(modelFileList);
      return;
    }

    setModelFileslist(
      modelFileList.filter((model) =>
        model.name.toLowerCase().includes(searchText.toLocaleLowerCase())
      )
    );
  };

  return (
    <ModelLibraryContainer>
      <ModelLibrarySidebar>
        <div className="header">
          <Formik
            initialValues={{}}
            onSubmit={() => {
              // eslint-disable-next-line no-console
              console.log('Submit search');
            }}
          >
            <Form>
              <Field
                as={Input}
                icon="Search"
                maxLength={64}
                name="modelName"
                placeholder="Search models"
                size="small"
                title=""
                fullWidth
                onChange={handleOnModelNameChange}
              />
            </Form>
          </Formik>
        </div>
        <div className="model-list">
          <div className="new-model">
            <Link to="/model-library/new-model">
              <Button icon="Add" type="primary" block>
                New model
              </Button>
            </Link>
          </div>
          <ModelList
            isFetchingModelFiles={isFetchingModelFiles}
            modelFiles={modelFilesList}
          />
        </div>
      </ModelLibrarySidebar>
      <ModelLibraryContent>
        <ModelDetails
          modelName={modelName}
          project={project}
          selectedTab={selectedTab}
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
  max-width: 400px;
  min-width: 400px;
  .header {
    background: var(--cogs-greyscale-grey1);
    padding: 0 24px;
    box-shadow: 0 0 2px var(--cogs-greyscale-grey5);
    form {
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
    margin-bottom: 12px;
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
