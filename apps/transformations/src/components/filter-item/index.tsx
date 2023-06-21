import { ColumnProfile } from '@transformations/hooks/profiling-service';
import { ALL_FILTER } from '@transformations/hooks/table-filters';

import { Button, IconType } from '@cognite/cogs.js';

export type FilterType = {
  type: ColumnProfile['type'] | typeof ALL_FILTER;
  value?: number;
  icon?: IconType;
  label?: string;
};

type Props = {
  filter: FilterType;
  active?: boolean;
  onClick: (filter: FilterType) => void;
};

export const FilterItem = ({ filter, active, onClick }: Props): JSX.Element => {
  const { type, value, icon, label } = filter;

  const isDisabled = !value;

  return (
    <Button
      icon={icon}
      type="tertiary"
      toggled={active && !isDisabled}
      disabled={isDisabled}
      onClick={() => onClick(filter)}
      size="small"
    >
      {icon ? value ?? 0 : `${value ?? 0} ${label ?? type}`}
    </Button>
  );
};
