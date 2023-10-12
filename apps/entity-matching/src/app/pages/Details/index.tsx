import { useParams } from 'react-router-dom';

import Pipeline from '../../components/pipeline';

export default function Details() {
  const { id = '-1' } = useParams<{
    id: string;
  }>();
  const idN = parseInt(id);

  if (!idN || !Number.isFinite(idN)) {
    return <>TODO: error management</>;
  }

  return <Pipeline id={idN} />;
}
