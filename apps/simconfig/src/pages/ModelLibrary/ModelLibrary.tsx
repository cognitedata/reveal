import { Button, CollapsablePanel, Title } from '@cognite/cogs.js';
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

import {
  IndicatorTitle,
  IndicatorTab,
  IndicatorContainer,
  IndicatorContainerImage,
} from './elements';

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

    history.push({
      pathname: `${url}/file-new`,
      state: {
        fileInfo: getLatestFileInfo(),
      },
    });
  };

  const onClosePanel = () => {
    dispatch(setSelectedFile(undefined));
  };

  const navigateToCalculation = () => {
    dispatch(setSelectedFile(getLatestFileInfo()));
    history.push(`/calculation-library/${modelName}`);
  };

  const Indicators = () => {
    const latestFileInfo = getLatestFileInfo();
    if (!latestFileInfo) {
      return null;
    }
    return (
      <IndicatorContainer>
        <IndicatorTab>
          <IndicatorTitle>Simulator</IndicatorTitle>
          <IndicatorContainerImage>
            <img
              src={`${
                process.env.PUBLIC_URL
              }/simulators/${latestFileInfo.source?.toLowerCase()}.png`}
              alt={latestFileInfo.source}
              style={{ marginRight: 12 }}
            />
            <p>{latestFileInfo.source}</p>
          </IndicatorContainerImage>
        </IndicatorTab>

        <IndicatorTab>
          <IndicatorTitle>Version</IndicatorTitle>
          <p>{latestFileInfo.metadata?.version}</p>
        </IndicatorTab>

        <IndicatorTab>
          <IndicatorTitle>Calculations</IndicatorTitle>
          <Button icon="FlowChart" onClick={navigateToCalculation} />
        </IndicatorTab>
      </IndicatorContainer>
    );
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
            <Title>{modelName || 'Model library'}</Title>
            {modelName && <Indicators />}
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
