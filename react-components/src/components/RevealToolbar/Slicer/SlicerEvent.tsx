/*!
 * Copyright 2023 Cognite AS
 */

import { EventTrigger } from '../../../utilities/EventTrigger';

export const sliceChangedEvent = new EventTrigger<(sliceState: number[]) => void>();
