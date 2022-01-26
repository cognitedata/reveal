import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { Annotation, DataElement, DataElementState } from 'scarlet/types';

export type Tag = Annotation & {
  id: string;
  dataElement: DataElement;
};

export const addTags = ({
  tags,
  ornateViewer,
  ornateDocument,
  onClick,
}: {
  tags: Tag[];
  ornateViewer: CogniteOrnate;
  ornateDocument: OrnatePDFDocument;
  onClick: (dataElement: DataElement) => void;
}) => {
  ornateViewer!.addAnnotationsToGroup(
    ornateDocument,
    tags.map((tag) => ({
      id: tag.id,
      type: 'pct',
      ...tag.boundingBox!,
      ...getColorsByTag(tag),
      strokeWidth: 6,
      cornerRadius: 8,
      onClick: () => {
        onClick(tag.dataElement);
      },
    }))
  );
};

export const removeTags = ({
  tagIds,
  ornateViewer,
}: {
  tagIds: string[];
  ornateViewer: CogniteOrnate;
}) => {
  const selector = tagIds.map((id) => `#${id}`).join(', ');
  const nodes = ornateViewer.stage.find(selector);
  nodes.forEach((node) => node.remove());
};

const getColorsByTag = (tag: Tag) =>
  tag.dataElement.state === DataElementState.APPROVED
    ? {
        stroke: '#18AF8E',
        fill: `rgba(7, 141, 121, 0.1)`,
      }
    : {
        stroke: '#FF8746',
        fill: 'rgba(255, 135, 70, 0.2)',
      };
