import { Button } from '@cognite/cogs.js';
import { Scalars } from 'graphql/generated';
import { useSetURLSearchParams } from 'hooks/useSetURLSearchParams';
import { HOME_ROUTES } from 'pages/constants';
import { Link } from 'react-router-dom';

interface Props {
  nodeId: Scalars['Int64'];
}

export const NavigationButton: React.FC<Props> = ({ nodeId }) => {
  const urlSearchParams = useSetURLSearchParams({ to: nodeId });
  const toPath = `${HOME_ROUTES.HOME_NAVIGATE}?${urlSearchParams.toString()}`;

  return (
    <Link to={toPath}>
      <Button type="primary" disabled={!nodeId}>
        Directions
      </Button>
    </Link>
  );
};
