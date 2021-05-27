const CLEAR_TAGS_TOOLTIP = 'Delete all annotations on this file';
const CANNOT_CLEAR_TAGS_TOOLTIP =
  'You are missing access to events:write to be able to clear annotations for this file.';

const VIEW_FILE_TOOLTIP = 'Preview this file';

const EDIT_FILE_TOOLTIP = 'Choose this diagram to make interactive';
const EDIT_NON_PDF_FILE_TOOLTIP =
  'This file cannot be made interactive because it is not PDF';

const LOAD_MORE_FILES_TOOLTIP =
  'Only 1000 files can be loaded at a time. You can load more manually.';

const CONVERT_TO_SVG_ALLOWED =
  'This will create or update an interactive SVG linked to the assets for the selected diagrams.';
const CONVERT_TO_SVG_NOT_SELECTED = 'No diagrams are selected.';
const CONVERT_TO_SVG_DISABLED =
  'Not all selected diagrams are possible to convert to SVG. This might be caused by some diagrams still being in "Pending" state or by the parsing job failing. Please check if all selected diagrams have finished parsing successfully.';

export const TOOLTIP_STRINGS = {
  CLEAR_TAGS_TOOLTIP,
  CANNOT_CLEAR_TAGS_TOOLTIP,
  EDIT_FILE_TOOLTIP,
  EDIT_NON_PDF_FILE_TOOLTIP,
  VIEW_FILE_TOOLTIP,
  LOAD_MORE_FILES_TOOLTIP,
  CONVERT_TO_SVG_ALLOWED,
  CONVERT_TO_SVG_NOT_SELECTED,
  CONVERT_TO_SVG_DISABLED,
};
