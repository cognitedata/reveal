import { Label } from '@cognite/cogs.js';

export interface Props {
  onClick: () => void;
  tag: string;
}

export const SelectedFilterLabel: React.FC<Props> = ({ onClick, tag }) => {
  return (
    <Label
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
