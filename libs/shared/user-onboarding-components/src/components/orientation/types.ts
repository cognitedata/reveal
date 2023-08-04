import { Step, TooltipRenderProps } from 'react-joyride';

import { IconType } from '@cognite/cogs.js';

import { OrientationEvent } from '../../metrics';

export interface InternalStep extends Omit<Step, 'content'> {
  title: string;
  icon: IconType;
  description: React.ReactNode;
}

export type Placement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

export type OrientationTooltipProps = TooltipRenderProps;

export interface OrientationContentProps {
  title: string;
  description: React.ReactNode;
  icon: IconType;
}
/**
 * OrientationState
 * ================
 * The state of the walkthrough.
 */
export interface OrientationState {
  /**
   * id
   * ==
   * The unique identifier of the walkthrough.
   */
  id?: string;
  /**

   * open
   * ====
   * Whether the walkthrough is open or not.
   */
  open?: boolean;
  /**
   * complete
   * ========
   * Whether the walkthrough is complete or not.
   * */
  complete?: boolean;
  /**
   * steps
   * =====
   * The steps of the walkthrough.
   * */
  steps?: InternalStep[];
  /**
   * enableHotspot
   * ==============
   * Whether the hotspot is enabled or not.
   */
  enableHotspot?: boolean;
  /**
  * nextButton
  * ==========

  * */
  nextButton?: string;

  /**
   * lastStepButton
   * ==========
   * The text of the last step button.
   * */
  lastStepButton?: string;
  /**
   * backButton
   * ==========
   * The text of the back button.
   * */
  backButton?: string;

  /**

  * onTrackEvent
  * =======
  * The function to call when a step is tracked.
  
   */
  onTrackEvent?: (
    eventName: OrientationEvent,
    metadata: Record<string, any>
  ) => void;
}
export interface OrientationContextInterface {
  handleState: React.Dispatch<React.SetStateAction<OrientationState>>;
  state: OrientationState;
}
