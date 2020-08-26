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
  const [availableRepositories, setAvailableRepositories] = useState<
    GenericResponseObject[]
  >([]);
  const [availableDataTypes, setAvailableDataTypes] = useState<
    GenericResponseObject[]
  >([]);
  const { api } = useContext(ApiContext);
  const { Option } = Select;

  async function fetchRepositories(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.STUDIO);
  }

  function handleChange(type: ChangeType, value: SelectValue) {
    if (type === ChangeType.REPO) {
      updateSourceRepository(value);
    } else if (type === ChangeType.TAGS) {
      updateBusinessTags(value);
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
          <main>
            {sourceUIState === SourceUIState.INITIAL && (
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
            )}
            {sourceUIState === SourceUIState.CONFIGURING && (
              <>
                <div>Select repository</div>
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
                    <div>Select tags</div>
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
                    <div>Select Datatypes</div>
                    <Checkbox.Group
                      options={[{ label: 'apple', value: 'apple' }]}
                    />
                  </>
                )}
              </>
            )}
          </main>
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
