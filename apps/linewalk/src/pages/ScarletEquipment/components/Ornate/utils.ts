import Konva from 'konva';
import { OrnatePDFDocument } from '@cognite/ornate';
import { ScarletDocument } from 'modules/scarlet/types';

const TEXT_PADDING = 40;
const TEXT_SIZE = 60;

export const addDocumentTitle = ({
  document,
  ornateDocument,
}: {
  document: ScarletDocument;
  ornateDocument: OrnatePDFDocument;
  pageNumber?: number;
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
}: {
  ornateDocument: OrnatePDFDocument;
  pageNumber?: number;
}) => {
  const text = new Konva.Text({
    text: `Page ${pageNumber}`,
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
