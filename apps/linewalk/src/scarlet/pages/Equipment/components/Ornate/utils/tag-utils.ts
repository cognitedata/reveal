import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import Konva from 'konva';
import { DetectionState, OrnateTag } from 'scarlet/types';

import { SIDE_PANEL_RIGHT_WIDTH } from '../..';

export const addTags = ({
  tags,
  ornateViewer,
  ornateDocument,
  onClick,
}: {
  tags: OrnateTag[];
  ornateViewer: CogniteOrnate;
  ornateDocument: OrnatePDFDocument;
  onClick: (tag: OrnateTag) => void;
}) => {
  ornateViewer!.addAnnotationsToGroup(
    ornateDocument,
    tags.map((tag) => ({
      id: tag.id,
      type: 'pct',
      ...tag.detection.boundingBox!,
      ...getColorsByTag(tag),
      strokeWidth: 6,
      cornerRadius: 8,
      onClick: () => {
        onClick(tag);
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

const getColorsByTag = (tag: OrnateTag) =>
  tag.detection.state === DetectionState.APPROVED
    ? {
        stroke: '#18AF8E',
        fill: `rgba(7, 141, 121, 0.1)`,
      }
    : {
        stroke: '#FF8746',
        fill: 'rgba(255, 135, 70, 0.2)',
      };

export const zoomToTag = (
  ornateViewer: CogniteOrnate,
  container: HTMLDivElement,
  node: Konva.Node,
  duration = 0.35,
  scaleFactor = 0.6
) => {
  const { width: stageWidth, height: stageHeight } =
    container.getBoundingClientRect();

  // shift here is due to sidebar
  // SIDE_PANEL_RIGHT_WIDTH is size of sidebar that potentially could be unopened or animating
  const widthShift = Math.max(
    ornateViewer.stage.width() - stageWidth,
    SIDE_PANEL_RIGHT_WIDTH
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - relativeTo DOES accept this.stage just fine.
  const rect = node.getClientRect({ relativeTo: ornateViewer.stage });
  const rawScale = Math.min(stageWidth / rect.width, stageHeight / rect.height);

  const scale = Math.min(Math.max(rawScale * scaleFactor, 0.3), 0.8);

  // Scale the location
  const location = {
    x: -rect.x - node.width() / 2 - widthShift / 2 / scale,
    y: -rect.y - node.height() / 2,
  };
  ornateViewer.zoomToLocation(location, scale, duration);
  node.getParent()?.findOne('Image')?.show();
};
