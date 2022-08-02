import { LinkButton } from 'components/LinkButton/LinkButton';
import { Scalars } from 'graphql/generated';
import { useSetURLSearchParams } from 'hooks/useSetURLSearchParams';
import { HOME_ROUTES } from 'pages/constants';

interface Props {
  nodeId: Scalars['Int64'];
}

export const NavigationButton: React.FC<Props> = ({ nodeId }) => {
  const urlSearchParams = useSetURLSearchParams({ to: nodeId });
  const toPath = `${HOME_ROUTES.HOME_NAVIGATE}?${urlSearchParams.toString()}`;

  return (
    <LinkButton to={toPath} type="primary" disabled={!nodeId}>
      Directions
    </LinkButton>
  );
};
