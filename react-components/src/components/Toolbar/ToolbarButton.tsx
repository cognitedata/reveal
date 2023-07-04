/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement } from 'react';
import { Button, type ButtonProps } from '@cognite/cogs.js';

export const ToolbarButton = (
  props: ButtonProps & React.RefAttributes<HTMLButtonElement>
): ReactElement => <Button type="ghost" {...props} />;
