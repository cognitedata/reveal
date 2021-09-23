import { Button, Title } from '@cognite/cogs.js';
import { Container, Header } from 'pages/elements';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ModelSource } from 'components/forms/ModelForm/constants';
import { FileInfo, ListResponse } from '@cognite/sdk';
import ModelTable from 'components/tables/ModelTable/ModelTable';

export default function ModelLibrary() {
  const { url } = useRouteMatch();
  const history = useHistory();
  const [files, setFiles] = useState<ListResponse<FileInfo[]>>();
  const cdfClient = useContext(CdfClientContext);

  async function loadData() {
    const files = await cdfClient.files.list({
      filter: {
        source: ModelSource.PROSPER,
        metadata: {
          nextVersion: '',
        },
      },
    });
    setFiles(files);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Model library</Title>
        <Button
          onClick={() => history.push(`${url}/new`)}
          type="primary"
          icon="PlusCompact"
        >
          New model
        </Button>
      </Header>
      <ModelTable data={files ? files.items : []} />
    </Container>
  );
}
