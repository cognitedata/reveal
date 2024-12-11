/*!
 * Copyright 2024 Cognite AS
 */

export type ButtonType = 'ghost' | 'ghost-destructive' | 'primary';

type Side = 'top' | 'right' | 'bottom' | 'left';

type Alignment = 'start' | 'end';

export type PlacementType = `${Side}-${Alignment}`;

export type FlexDirection = 'row' | 'column';
