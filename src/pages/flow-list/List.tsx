import { createLink } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { CANVAS_PATH } from 'common';
import { useFlowList } from 'hooks/raw';
import { Link } from 'react-router-dom';
import DeleteButton from './DeleteButton';

export default function List({}: {}) {
  const { data, isLoading, error } = useFlowList();
  if (isLoading) {
    return <Icon type="Loader" />;
  }
  if (error) {
    return (
      <div>
        <p>Error</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
  return (
    <ul>
      {data?.map((row) => (
        <li key={row.id}>
          <Link to={createLink(`/${CANVAS_PATH}/${row.id}`)}>{row.name}</Link>
          <DeleteButton id={row.id} />
        </li>
      ))}
    </ul>
  );
}
