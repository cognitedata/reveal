/*!
 * Copyright 2023 Cognite AS
 */

import React from 'react';
import { Button, ButtonProps } from '@cognite/cogs.js';

export const ToolbarButton = (props: ButtonProps & React.RefAttributes<HTMLButtonElement>) => (
  <Button type="ghost" {...props} />
);
