import { v4 as uuid } from 'uuid';

import { ContainerReference } from '../types';

export const addIdToContainerReference = <T extends ContainerReference>(
  containerReference: T
): T => ({
  ...containerReference,
  id: containerReference.id ?? uuid(),
});
