import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Input, Select } from '@cognite/cogs.js';

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
    data: { modelFiles },
  } = useMatch<AppLocationGenerics>();
  const navigate = useNavigate();

  if (!modelName && modelFiles?.modelFileList) {
    const firstFile = modelFiles.modelFileList[0];
    navigate({
      to: `/model-library/models/${encodeURIComponent(
        firstFile.source
      )}/${encodeURIComponent(firstFile.metadata.modelName)}`,
      replace: true,
    });
  }

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
                placeholder="Filter by model name"
                size="small"
                title=""
                fullWidth
              />
              <Field
                as={Select}
                icon="Configure"
                name="attributes"
                title="Filter by"
                fullWidth
              />
              <Field as={Select} name="sortBy" title="Sort by" disableTyping />
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
          <ModelList modelFiles={modelFiles?.modelFileList ?? []} />
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
  min-width: 250px;
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
