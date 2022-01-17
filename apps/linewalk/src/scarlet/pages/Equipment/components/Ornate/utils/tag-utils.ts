import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { Annotation, DataElement } from 'scarlet/types';

export type Tag = Annotation & {
  id: string;
  dataElement: DataElement;
};

export const addTags = ({
  tags,
  ornateViewer,
  ornateDocument,
}: {
  tags: Tag[];
  ornateViewer: CogniteOrnate;
  ornateDocument: OrnatePDFDocument;
}) => {
  ornateViewer!.addAnnotationsToGroup(
    ornateDocument,
    tags.map((tag) => ({
      id: tag.id,
      type: 'pct',
      ...tag.boundingBox!,
      stroke: '#FF8746',
      strokeWidth: 6,
      fill: 'rgba(255, 135, 70, 0.2)',
      cornerRadius: 8,
      onClick: () => {
        console.log(tag.dataElement);
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
