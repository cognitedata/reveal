let current = 10;
const next = () => {
  current += 10;
  return current;
};

const layers = [
  'MAXIMUM',

  /** The global navigation menu mask */
  'GLOBAL_NAVIGATION_MENU_MASK',

  /** The saved change ANT notification */
  'CHANGES_SAVED_NOTIFICATION',

  /** The save button used in the Data Sets Subapp */
  'DATA_SETS_SAVE_BUTTON',

  /** The save button used in the Data Sets Subapp */
  'DATA_SETS_PREVIEW_TOOLBAR',

  /** The threed viewer overlay button */
  'THREED_VIEWER_OVERLAY_BUTTON',

  /** The global navigation menu mask */
  'GLOBAL_NAVIGATION_BAR',

  /** The default z-index for all components */
  'DEFAULT',

  'MINIMUM',
];

type Layer = typeof layers[number];

type LayerLookup = { [key in Layer]: number };

const initialValue: Partial<LayerLookup> = {};

export default layers.reverse().reduce((acc, layer) => {
  acc[layer] = next();
  return acc;
}, initialValue) as LayerLookup;
