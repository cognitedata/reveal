import { Label } from '@cognite/cogs.js';

export interface Props {
  onClick: () => void;
  key: string;
  tag: string;
}

export const SelectedFilterLabel: React.FunctionComponent<Props> = ({
  onClick,
  key,
  tag,
}) => {
  return (
    <Label
      key={key}
      size="medium"
      variant="default"
      icon="Close"
      iconPlacement="right"
      onClick={onClick}
      data-testid="filter-tag"
    >
      {tag}
    </Label>
  );
};
