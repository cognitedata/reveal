import { Container } from 'pages/elements';
import { useRouteMatch } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { CdfClientContext } from 'providers/CdfClientProvider';
import CalculationsTable from 'components/tables/CalculationsTable/CalculationsTable';
import { fetchFiles } from 'store/file/thunks';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectFiles, selectSelectedFile } from 'store/file/selectors';

import TitleArea from './TitleArea';
import { FileDataType } from './constants';

type Params = {
  modelName?: string;
};

export default function CalculationsLibrary() {
  const { params } = useRouteMatch<Params>();
  const { modelName } = params;
  const latestFile = useAppSelector(selectSelectedFile);
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectFiles);
  const { cdfClient } = useContext(CdfClientContext);
  const getFilter = () => {
    return {
      source: latestFile?.source,
      metadata: {
        dataType: FileDataType.SimConfig,
        modelName: modelName || 'Test-Model',
      },
    };
  };

  async function loadData() {
    const filter = getFilter();
    dispatch(fetchFiles({ client: cdfClient, filter }));
  }

  useEffect(() => {
    loadData();
  }, [modelName]);

  return (
    <Container>
      <TitleArea fileData={latestFile} />

      <CalculationsTable data={files} />
    </Container>
  );
}
