import { Button, CollapsablePanel, Title } from '@cognite/cogs.js';
import { CollapsableContainer, Container, Header } from 'pages/elements';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ModelSource } from 'components/forms/ModelForm/constants';
import { BoundaryConditionContent } from 'pages/ModelLibrary/BoundaryConditionContent';
import ModelTable from 'components/tables/ModelTable/ModelTable';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchDownloadLinks, fetchFiles } from 'store/file/thunks';
import {
  selectDownloadLinks,
  selectFiles,
  selectIsFilesInitialized,
  selectSelectedFile,
} from 'store/file/selectors';
import { FileInfoSerializable } from 'store/file/types';
import { setSelectedFile } from 'store/file';
import sortBy from 'lodash/sortBy';

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
  const isFilesInitialized = useAppSelector(selectIsFilesInitialized);
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

  async function loadUrls() {
    if (!isFilesInitialized) {
      return;
    }
    dispatch(
      fetchDownloadLinks({
        client: cdfClient,
        externalIds: files.map(({ externalId = '' }) => ({ externalId })),
      })
    );
  }

  useEffect(() => {
    loadData();
  }, [modelName]);

  useEffect(() => {
    loadUrls();
  }, [files]);

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
            <Button onClick={onClick} type="primary" icon="PlusCompact">
              {!modelName ? 'New model' : 'New version'}
            </Button>
          </Header>
          <ModelTable data={files} modelName={modelName} links={links} />
        </Container>
      </CollapsablePanel>
    </CollapsableContainer>
  );
}
