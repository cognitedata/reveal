/*!
 * Copyright 2023 Cognite AS
 */

import { type Dispatch, type SetStateAction, type ReactElement } from 'react';

export type HighFidelityProps = {
  isHighFidelityMode: boolean;
  setHighFidelityMode: Dispatch<SetStateAction<boolean>>;
};

export type SettingsContainerProps = HighFidelityProps & {
  customSettingsContent?: ReactElement;
};
