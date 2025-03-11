/*!
 * Copyright 2025 Cognite AS
 */

import { useContext } from 'react';
import {
  Reveal3DResourcesContext,
  type Reveal3DResourcesDependencies
} from './Reveal3DResources.context';

export function use3DResourcesViewModel(): Reveal3DResourcesDependencies {
  return useContext(Reveal3DResourcesContext);
}
