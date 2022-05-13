export const BOUNDING_BOX_PADDING_PX = 3;

export const LINE_NUMBER_ANNOTATION_STYLE = {
  fill: 'rgba(74, 103, 251, 0.1)',
  stroke: 'rgba(74, 103, 251, 0.7)',
  strokeWidth: 1.8,
  padding: 8,
};

export const NAVIGATIABLE_ANNOTATION_STYLE = {
  fill: 'rgba(24, 175, 142, 0.1)',
  stroke: '#00665C',
  strokeWidth: 1.8,
  dash: [3, 3] as [number, number],
  padding: BOUNDING_BOX_PADDING_PX,
};
