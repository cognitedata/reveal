/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { type QualitySettings } from '../../../architecture/base/utilities/quality/QualitySettings';

export type QualityProps = {
  lowQualitySettings?: Partial<QualitySettings>;
  highQualitySettings?: Partial<QualitySettings>;
};

export type SettingsContainerProps = QualityProps & {
  customSettingsContent?: ReactElement;
};
