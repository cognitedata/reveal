import Konva from 'konva';
import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { DataElement, ScarletDocument } from 'scarlet/types';

const TEXT_PADDING = 40;
const TEXT_SIZE = 60;

export const addDocumentTitle = ({
  document,
  ornateDocument,
}: {
  document: ScarletDocument;
  ornateDocument: OrnatePDFDocument;
}) => {
  const text = new Konva.Text({
    text: document.metadata?.document_type,
    fill: 'rgba(0, 0, 0, 0.45)',
    fontSize: TEXT_SIZE,
    padding: TEXT_PADDING,
  });

  const groupWidth = text.getWidth();
  const groupHeight = text.getHeight();

  const group = new Konva.Group({
    x: 0,
    y: -(groupHeight + 1),
    width: groupWidth,
    height: groupHeight,
    name: 'title',
  });

  group.add(
    new Konva.Rect({
      fill: '#ffffff',
      x: 0,
      y: 0,
      width: groupWidth,
      height: groupHeight,
    })
  );
  group.add(text);

  ornateDocument.group.add(group);
};

export const addPageNumber = ({
  ornateDocument,
  pageNumber,
  totalPages,
}: {
  ornateDocument: OrnatePDFDocument;
  pageNumber: number;
  totalPages: number;
}) => {
  const text = new Konva.Text({
    text: `Page ${pageNumber} of ${totalPages}`,
    fill: '#595959',
    fontSize: TEXT_SIZE,
    padding: TEXT_PADDING,
  });

  const groupWidth = text.getWidth();
  const groupHeight = text.getHeight();

  const group = new Konva.Group({
    x: ornateDocument.group.findOne('.title')?.getSize().width || 0,
    y: -(groupHeight + 1),
    width: groupWidth,
    height: groupHeight,
    name: 'page',
  });

  group.add(
    new Konva.Rect({
      fill: '#ECECEC',
      x: 0,
      y: 0,
      width: groupWidth,
      height: groupHeight,
    })
  );

  group.add(text);
  ornateDocument.group.add(group);
};

export const addTags = ({
  ornateViewer,
  dataElements,
  ornateDocument,
}: {
  ornateViewer: CogniteOrnate;
  dataElements: DataElement[];
  ornateDocument: OrnatePDFDocument;
}) => {
  ornateViewer!.addAnnotationsToGroup(
    ornateDocument,
    dataElements.map((dataElement) => ({
      id: dataElement.id,
      type: 'pct',
      ...dataElement.boundingBox!,
      stroke: '#D51A46',
      strokeWidth: 6,
      fill: 'rgba(244, 113, 139, 0.2)',
      cornerRadius: 8,
      // onClick: (x) => {
      //   console.log(annotation, x);
      // },
    }))
  );
};
