import React, { useContext, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { Checkbox, Select } from 'antd';
import {
  Configuration,
  DummyUser,
  GenericResponseObject,
  Source,
} from 'typings/interfaces';
import { SelectValue } from 'antd/es/select';
import {
  ConfigurationArrow,
  ConfigurationContainer,
  Header,
  InitialState,
  ThreeColsLayout,
} from '../elements';
import ApiContext from '../../../contexts/ApiContext';

type Props = {
  name: string | undefined | null;
};

enum SourceUIState {
  INITIAL,
  CONFIGURING,
}

enum ChangeType {
  REPO,
  TAGS,
  DATATYPES,
}

const PetrelStudioToOpenWorks = ({ name }: Props) => {
  const [configuration, setConfiguration] = useState<Configuration>({
    name,
    source: {
      external_id: '',
      source: Source.STUDIO,
    },
    target: {
      external_id: '',
      source: Source.OPENWORKS,
    },
    business_tags: [],
    author: DummyUser.ERLAND,
    datatypes: [],
  });
  const [configurationIsComplete, setConfigurationIsComplete] = useState<
    boolean
  >(false);
  const [sourceUIState, setSourceUIState] = useState<SourceUIState>(
    SourceUIState.INITIAL
  );
  const [sourceComplete, setSourceComplete] = useState<boolean>(false);
  const [availableRepositories, setAvailableRepositories] = useState<
    GenericResponseObject[]
  >([]);
  const [availableDataTypes, setAvailableDataTypes] = useState<
    { label: string; value: string }[]
  >([
    {
      label: 'apple',
      value: 'apple',
    },
  ]);
  const { api } = useContext(ApiContext);
  const { Option } = Select;

  async function fetchRepositories(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.STUDIO);
  }

  async function fetchDataTypes(projectId: number): Promise<string[]> {
    return api!.datatypes.get(projectId);
  }

  function getRepositoryIdInArrayFromExternalId(externalId: string) {
    return availableRepositories.find(
      (element) => element.external_id === externalId
    );
  }

  function handleChange(type: ChangeType, value: SelectValue) {
    if (type === ChangeType.REPO) {
      updateSourceRepository(value);
      fetchDataTypes(
        getRepositoryIdInArrayFromExternalId(value.toString())!.id
      ).then((response) => {
        const results: any = [];
        response.map((item) => results.push({ label: item, value: item }));
        setAvailableDataTypes(results);
        updateDataTypes([]);
      });
    } else if (type === ChangeType.TAGS) {
      updateBusinessTags(value);
    } else if (type === ChangeType.DATATYPES) {
      updateDataTypes(value);
    }
  }

  function updateSourceRepository(value: SelectValue) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        source: { ...prevState.source, external_id: value.toString() },
      };
    });
  }

  function updateBusinessTags(value: any) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        business_tags: value,
      };
    });
  }

  function updateDataTypes(value: any) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        datatypes: value,
      };
    });
  }

  return (
    <div>
      <Header>
        <b>{name}</b>
        <Button
          type="primary"
          style={{ height: '36px' }}
          disabled={!configurationIsComplete}
        >
          Save Configuration
        </Button>
      </Header>
      <ThreeColsLayout>
        <ConfigurationContainer>
          <header>
            <b>Petrel Studio</b>
          </header>
          {sourceUIState === SourceUIState.INITIAL && (
            <main>
              <InitialState>
                <p>No source repository selected</p>
                <Button
                  type="primary"
                  onClick={() => {
                    setSourceUIState(SourceUIState.CONFIGURING);
                    fetchRepositories().then((response) =>
                      setAvailableRepositories(response)
                    );
                  }}
                >
                  Configure
                </Button>
              </InitialState>
            </main>
          )}
          {sourceUIState === SourceUIState.CONFIGURING && (
            <>
              <main>
                <div>Select repository:</div>
                <Select
                  defaultValue={undefined}
                  placeholder="Available repositories"
                  style={{ width: '100%', marginBottom: '16px' }}
                  onChange={(value) => handleChange(ChangeType.REPO, value)}
                >
                  {availableRepositories.map((repository) => (
                    <Option
                      key={repository.external_id}
                      value={repository.external_id}
                    >
                      {repository.external_id}
                    </Option>
                  ))}
                </Select>
                {configuration.source.external_id !== '' && (
                  <>
                    <div>Select tags:</div>
                    <Select
                      mode="tags"
                      placeholder="Available tags"
                      style={{ width: '100%', marginBottom: '16px' }}
                      onChange={updateBusinessTags}
                    >
                      <Option value="gas">Gas</Option>
                      <Option value="oil">Oil</Option>
                      <Option value="flux-capacitator">Flux Capacitator</Option>
                      <Option value="kerfuffle">Kerfuffle</Option>
                      <Option value="mr-fluffy">Mr. Fluffy</Option>
                    </Select>
                    <div>Select Datatypes:</div>
                    <Checkbox.Group
                      options={availableDataTypes}
                      onChange={(value: any) =>
                        handleChange(ChangeType.DATATYPES, value)
                      }
                    />
                  </>
                )}
              </main>
              <footer>
                <Button type="primary" disabled={!sourceComplete}>
                  Confirm
                </Button>
              </footer>
            </>
          )}
        </ConfigurationContainer>
        <ConfigurationArrow />
        <ConfigurationContainer>
          <header>
            <b>OpenWorks</b>
          </header>
        </ConfigurationContainer>
      </ThreeColsLayout>
    </div>
  );
};

export default PetrelStudioToOpenWorks;
