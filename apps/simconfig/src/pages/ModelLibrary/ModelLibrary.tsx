import { Button, CollapsablePanel, Title } from '@cognite/cogs.js';
import { CollapsableContainer, Container, Header } from 'pages/elements';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ModelSource } from 'components/forms/ModelForm/constants';
import { FileInfo } from '@cognite/sdk';
import { BoundaryConditionContent } from 'pages/ModelLibrary/BoundaryConditionContent';
import ModelTable from 'components/tables/ModelTable/ModelTable';

import { LinkWithID } from './types';

type Params = {
  modelName?: string;
};

export default function ModelLibrary() {
  const { url, params } = useRouteMatch<Params>();
  const { modelName } = params;
  const history = useHistory();
  const location = useLocation();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [links, setLinks] = useState<LinkWithID[]>();
  const [selectedRow, setSelectedRow] = useState(undefined);
  const cdfClient = useContext(CdfClientContext);
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
    const files = await cdfClient.files.list({
      filter: getFilter(),
    });

    if (!files) {
      return;
    }
    const urls = await cdfClient.files.getDownloadUrls(
      files.items.map(({ externalId = '' }) => ({ externalId }))
    );
    setLinks(urls);
    setSelectedRow(undefined);
    setFiles(files.items);
  }

  useEffect(() => {
    loadData();
  }, [modelName]);

  useEffect(() => {
    setSelectedRow(undefined);
  }, [location]);

  const getLatestFile = (items: FileInfo[]) =>
    items.sort(
      (a, b) =>
        parseInt(b.metadata?.version || '0', 10) -
        parseInt(a.metadata?.version || '0', 10)
    )[0];

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
    setSelectedRow(undefined);
  };

  return (
    <CollapsableContainer>
      <CollapsablePanel
        sidePanelRightWidth={330}
        sidePanelRight={
          <BoundaryConditionContent
            onClosePanel={onClosePanel}
            data={selectedRow}
          />
        }
        sidePanelRightVisible={Boolean(selectedRow)}
      >
        <Container>
          <Header>
            <Title>{modelName || 'Model library'}</Title>
            <Button onClick={onClick} type="primary" icon="PlusCompact">
              {!modelName ? 'New model' : 'New version'}
            </Button>
          </Header>
          <ModelTable
            data={files}
            modelName={modelName}
            links={links}
            setSelectedRow={setSelectedRow}
          />
        </Container>
      </CollapsablePanel>
    </CollapsableContainer>
  );
}
