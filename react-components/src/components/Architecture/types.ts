type Side = 'top' | 'right' | 'bottom' | 'left';

type Alignment = 'start' | 'end';

export type PlacementType = Side | `${Side}-${Alignment}`;

export type FlexDirection = 'row' | 'column';
