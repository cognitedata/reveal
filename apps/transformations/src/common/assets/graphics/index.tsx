import { default as EmptyStateArrowGraphic } from './EmptyStateArrowGraphic.svg';
import { default as TemplateGraphic } from './TemplateGraphic.svg';

const graphics = {
  EmptyStateArrowGraphic,
  TemplateGraphic,
};

export type GraphicType = keyof typeof graphics;

export default graphics;
