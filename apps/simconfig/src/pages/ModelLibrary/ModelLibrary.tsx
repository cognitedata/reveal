import { Button, Title } from '@cognite/cogs.js';
import { Container, Header } from 'pages/elements';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ModelSource } from 'components/forms/ModelForm/constants';
import { FileInfo } from '@cognite/sdk';
import ModelTable from 'components/tables/ModelTable/ModelTable';

import { LinkWithID } from './types';

type Params = {
  modelName?: string;
};

export default function ModelLibrary() {
  const { url, params } = useRouteMatch<Params>();
  const { modelName } = params;
  const history = useHistory();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [links, setLinks] = useState<LinkWithID[]>();
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
    setFiles(files.items);
  }

  useEffect(() => {
    loadData();
  }, [modelName]);

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
      pathname: `${url}/version-new`,
      state: {
        fileInfo: latestFile,
        file: blob,
      },
    });
  };

  return (
    <Container>
      <Header>
        <Title>{modelName || 'Model library'}</Title>
        <Button onClick={onClick} type="primary" icon="PlusCompact">
          {!modelName ? 'New model' : 'New Version'}
        </Button>
      </Header>
      <ModelTable data={files} modelName={modelName} links={links} />
    </Container>
  );
}
