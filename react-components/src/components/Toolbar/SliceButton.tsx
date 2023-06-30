/*!
 * Copyright 2023 Cognite AS
 */

import React, { useEffect, useState } from 'react';

import { ToolbarButton } from './ToolbarButton';

import { useReveal } from '../RevealContainer/RevealContext';

export const SliceButton = () => {
  const viewer = useReveal();

  const [yClip, setYClip] = useState<number | undefined>(undefined);

  useEffect(() => {}, []);

  return <ToolbarButton icon="Slice" aria-label="Slice models" />;
};
