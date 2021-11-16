import { Button, CollapsablePanel } from '@cognite/cogs.js';
import { CollapsableContainer, Container, Header } from 'pages/elements';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { BoundaryConditionContent } from 'pages/ModelLibrary/BoundaryConditionContent';
import ModelTable from 'components/tables/ModelTable/ModelTable';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchFiles } from 'store/file/thunks';
import { setSelectedFile } from 'store/file';
import { selectFiles, selectSelectedFile } from 'store/file/selectors';
import { DEFAULT_MODEL_SOURCE } from 'components/forms/ModelForm/constants';

import { DATA_TYPE_FILE } from './constants';
import TitleArea from './TitleArea';

type Params = {
  modelName?: string;
};

export default function ModelLibrary() {
  const { url, params } = useRouteMatch<Params>();
  const selectedFileVersion = useAppSelector(selectSelectedFile);
  const { modelName } = params;
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectFiles);
  const history = useHistory();
  const location = useLocation();
  const { cdfClient } = useContext(CdfClientContext);
  const getFilter = () => {
    if (modelName) {
      return {
        source: DEFAULT_MODEL_SOURCE,
        name: modelName,
      };
    }
    return {
      source: DEFAULT_MODEL_SOURCE,
      metadata: {
        nextVersion: '',
        dataType: DATA_TYPE_FILE,
      },
    };
  };

  // XXX needs to be refactored
  const getLatestFileInfo = () =>
    files.find((file) => !file.metadata?.nextVersion);

  async function loadData() {
    const filter = getFilter();
    dispatch(fetchFiles({ client: cdfClient, filter }));

    dispatch(setSelectedFile(undefined));
  }

  useEffect(() => {
    loadData();
  }, [modelName]);

  useEffect(() => {
    dispatch(setSelectedFile(undefined));
  }, [location]);

  const onClick = async () => {
    if (!modelName) {
      history.push(`${url}/new`);
      return;
    }

    history.push(`${url}/new-version`);
  };

  const onClosePanel = () => {
    dispatch(setSelectedFile(undefined));
  };

  return (
    <CollapsableContainer>
      <CollapsablePanel
        sidePanelRightWidth={330}
        sidePanelRight={
          <BoundaryConditionContent
            onClosePanel={onClosePanel}
            data={selectedFileVersion}
          />
        }
        sidePanelRightVisible={Boolean(selectedFileVersion)}
      >
        <Container>
          <Header>
            <TitleArea
              modelName={modelName || 'Model library'}
              showIndicators={!modelName}
              latestFile={getLatestFileInfo()}
            />
            <Button onClick={onClick} type="primary" icon="PlusCompact">
              {!modelName ? 'New model' : 'New version'}
            </Button>
          </Header>
          <ModelTable data={files} modelName={modelName} />
        </Container>
      </CollapsablePanel>
    </CollapsableContainer>
  );
}
