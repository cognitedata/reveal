/*!
 * Copyright 2024 Cognite AS
 */

import { useState } from 'react';
import { type DmsUniqueIdentifier } from '..';

export const useSelectedScene = (): [
  DmsUniqueIdentifier | undefined,
  (scene?: DmsUniqueIdentifier) => void
] => {
  const [selectedScene, setSelectedScene] = useState<DmsUniqueIdentifier | undefined>(undefined);

  return [selectedScene, setSelectedScene];
};
