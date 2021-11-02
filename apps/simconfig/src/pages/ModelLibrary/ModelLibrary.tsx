import { Button, CollapsablePanel, Title } from '@cognite/cogs.js';
import { CollapsableContainer, Container, Header } from 'pages/elements';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ModelSource } from 'components/forms/ModelForm/constants';
import { BoundaryConditionContent } from 'pages/ModelLibrary/BoundaryConditionContent';
import ModelTable from 'components/tables/ModelTable/ModelTable';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchFiles } from 'store/file/thunks';
import { FileInfoSerializable } from 'store/file/types';
import { setSelectedFile } from 'store/file';
import sortBy from 'lodash/sortBy';
import {
  selectDownloadLinks,
  selectFiles,
  selectSelectedFile,
} from 'store/file/selectors';

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
  const links = useAppSelector(selectDownloadLinks);
  const history = useHistory();
  const location = useLocation();
  const { cdfClient } = useContext(CdfClientContext);
  const getFilter = () => {
    if (modelName) {
      return {
        source: ModelSource.PROSPER,
        name: modelName,
      };
    }
    return {
      source: ModelSource.PROSPER,
      metadata: {
        nextVersion: '',
      },
    };
  };

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

  const getLatestFile = (items: FileInfoSerializable[]) => {
    return sortBy(items, 'metadata.version')[0];
  };

  const onClick = async () => {
    if (!modelName) {
      history.push(`${url}/new`);
      return;
    }

    if (!links || !files) {
      return;
    }
    const latestFile = getLatestFile(files);
    const matchingLink = links.find(
      (url) => 'externalId' in url && latestFile.externalId === url.externalId
    );
    if (!matchingLink) {
      return;
    }

    const fileUrl = await (await fetch(matchingLink.downloadUrl)).blob();
    const blob = new File([fileUrl], modelName);
    history.push({
      pathname: `${url}/file-new`,
      state: {
        fileInfo: latestFile,
        file: blob,
      },
    });
  };

  const onClosePanel = () => {
    dispatch(setSelectedFile(undefined));
  };

  const Indicators = () => {
    const lastFile = sortBy(files, 'metadata.version')[files.length - 1];
    return (
      <IndicatorContainer>
        <IndicatorTab>
          <IndicatorTitle>SIMULATOR</IndicatorTitle>
          <IndicatorContainerImage>
            <img
              src={`${
                process.env.PUBLIC_URL
              }/simulators/${lastFile.source?.toLowerCase()}.png`}
              alt={lastFile.source}
              style={{ marginRight: 12 }}
            />
            <p>{lastFile.source}</p>
          </IndicatorContainerImage>
        </IndicatorTab>

        <IndicatorTab>
          <IndicatorTitle>VERSION</IndicatorTitle>
          <p>{lastFile.metadata?.version}</p>
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
