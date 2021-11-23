/*!
 * Copyright 2021 Cognite AS
 */
import { Keyframe } from './Keyframe';
/**
 * Delegate for Timeline Date update
 */
export type TimelineDateUpdateDelegate = (event: {
  date: Date;
  activeKeyframe: Keyframe | undefined;
  startDate: Date;
  endDate: Date;
}) => void;
