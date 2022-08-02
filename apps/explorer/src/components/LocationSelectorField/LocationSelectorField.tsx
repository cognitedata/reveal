import { Icon } from '@cognite/cogs.js';
import { LinkButton } from 'components/LinkButton/LinkButton';

import { FieldWrapper } from './elements';

interface Props {
  name: string | undefined;
  onClear: () => void;
  route: string;
}
export const LocationSelectorField: React.FC<Props> = ({
  name,
  onClear,
  route,
}) => {
  return (
    <FieldWrapper>
      {name ? (
        <>
          {name}
          <Icon onClick={onClear} type="Close" />
        </>
      ) : (
        <LinkButton replace to={route} icon="Search" type="ghost">
          Choose a location
        </LinkButton>
      )}
    </FieldWrapper>
  );
};
