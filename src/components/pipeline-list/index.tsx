import { Icon } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { useEMPipelines } from 'hooks/contextualization-api';
import { Link, useParams } from 'react-router-dom';

export default function PipelineList() {
  const { data, isInitialLoading } = useEMPipelines();

  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <ul>
      {data?.map(({ id, name }) => {
        return (
          <li key={id}>
            <Link to={createLink(`/${subAppPath}/${id}`)}>{name || id}</Link>
          </li>
        );
      })}
    </ul>
  );
}
