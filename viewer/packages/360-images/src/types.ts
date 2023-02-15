/*!
 * Copyright 2023 Cognite AS
 */

import { Image360 } from './entity/Image360';

/**
 * Delegate for 360 image mode entered events.
 */
export type Image360EnteredDelegate = (image360: Image360) => void;

/**
 * Delegate for 360 image mode exited events.
 */
export type Image360ExitedDelegate = () => void;
