import { BaseButton } from './BaseButton';
import {
  REORDER_BUTTON_SIZE,
  REORDER_BUTTON_TOOLTIP_PLACEMENT,
  REORDER_ASCENDING_TOOLTIP,
  REORDER_DESCENDING_TOOLTIP,
} from './constants';
import { ExtendedButtonProps } from './types';

const Default: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size={REORDER_BUTTON_SIZE}
    icon="ReorderDefault"
    data-testid="default-sort"
    aria-label="Reset order"
    {...props}
  />
);

const Ascending: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size={REORDER_BUTTON_SIZE}
    icon="ReorderAscending"
    tooltip={REORDER_ASCENDING_TOOLTIP}
    tooltipPlacement={REORDER_BUTTON_TOOLTIP_PLACEMENT}
    data-testid="ascending-sort"
    aria-label="Sort Ascending"
    {...props}
  />
);

const Descending: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size={REORDER_BUTTON_SIZE}
    icon="ReorderDescending"
    tooltip={REORDER_DESCENDING_TOOLTIP}
    tooltipPlacement={REORDER_BUTTON_TOOLTIP_PLACEMENT}
    data-testid="descending-sort"
    aria-label="Sort Descending"
    {...props}
  />
);

export const ReorderButton = { Default, Ascending, Descending };
