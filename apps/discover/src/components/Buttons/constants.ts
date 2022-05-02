import { ButtonSize, ButtonType } from '@cognite/cogs.js';

import { TooltipPlacement } from 'components/Tooltip';
import { sizes } from 'styles/layout';

/**
 * These default values are applied unless specifed in the props passed into `BaseButton`.
 * These are the most common values used. Hence specified them as default to reduce the lines of code.
 * The defaults defined here are supposed to override the defaults set in cogs or any other reused components.
 */
export const DEFAULT_BUTTON_TYPE: ButtonType = 'ghost';
export const DEFAULT_TOOLTIP_PLACEMENT: TooltipPlacement = 'top';

// Values that should be kept in sync
export const BUTTON_SPACING = sizes.small;
export const OPERATOR_BUTTON_SIZE: ButtonSize = 'default';
export const OPERATOR_BUTTON_TYPE: ButtonType = 'tertiary';
export const REORDER_BUTTON_SIZE: ButtonSize = 'small';
export const REORDER_BUTTON_TOOLTIP_PLACEMENT: TooltipPlacement = 'bottom';

// Default button text contents
export const PREVIEW_BUTTON_TEXT = 'Preview';
export const VIEW_BUTTON_TEXT = 'View';
export const LOAD_MORE_BUTTON_TEXT = 'Load more';
export const HIDE_BUTTON_TEXT = 'Hide';

// Default tooltips
export const DUPLICATE_BUTTON_TOOLTIP = 'Duplicate';
export const EDIT_BUTTON_TOOLTIP = 'Edit';
export const SHARE_BUTTON_TOOLTIP = 'Share';
export const DELETE_BUTTON_TOOLTIP = 'Delete';
export const DOWNLOAD_BUTTON_TOOLTIP = 'Download';
export const BACK_BUTTON_TOOLTIP = 'Go back';
export const CLOSE_BUTTON_TOOLTIP = 'Close';
export const PLUS_BUTTON_TOOLTIP = 'Increment';
export const MINUS_BUTTON_TOOLTIP = 'Decrement';
export const FEEDBACK_BUTTON_TOOLTIP = 'Feedback';
export const REORDER_ASCENDING_TOOLTIP = 'Sort Ascending';
export const REORDER_DESCENDING_TOOLTIP = 'Sort Descending';
export const SEARCH_BUTTON_TOOLTIP = 'Search';

// Button icon class prefix
export const COGS_ICON_CLASS_PREFIX = 'cogs-icon';
