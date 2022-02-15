import { Point } from '../geometry';
import { FileConnectionInstance, Rect, FileDirection } from '../types';

import { PidDocument } from './PidDocument';
import { PidTspan } from './PidTspan';

interface NormalizedLabel {
  normalizedMidPoint: Point;
  text: string;
  id: string;
}

const normalizeLabels = (
  pidLabels: PidTspan[],
  viewBox: Rect
): NormalizedLabel[] => {
  return pidLabels.map((pidLabel) => {
    const normalizedMidPoint = Point.midPointFromBoundingBox(
      pidLabel.boundingBox
    ).normalize(viewBox);
    return {
      normalizedMidPoint,
      text: pidLabel.text.trim(),
      id: pidLabel.id,
    };
  });
};

const getClosestNormalizedLabel = (
  point: Point,
  normalizedLabel: NormalizedLabel[]
) => {
  let closestLabel = normalizedLabel[0];
  let minDistance = Infinity;
  normalizedLabel.forEach((label) => {
    const distance = point.distance(label.normalizedMidPoint);
    if (distance < minDistance) {
      closestLabel = label;
      minDistance = distance;
    }
  });

  return closestLabel;
};

export const getFileConnectionsWithPosition = (
  pidDocument: PidDocument,
  fileConnections: FileConnectionInstance[]
): FileConnectionInstance[] => {
  const leftColumnThreshold = 0.08;
  const leftFileConnectionThreshold = 0.15;
  const rightColumnThreshold = 0.92;
  const rightFileConnectionThreshold = 0.85;
  const topColumnThreshold = 0.05;
  const topFileConnectionThreshold = 0.2;

  const oneOrTwoDigitNumberRegex = /^[0-9]{1,2}$/;

  const normalizedLabels = normalizeLabels(
    pidDocument.pidLabels,
    pidDocument.viewBox
  );

  const leftColumnLabels = normalizedLabels.filter((label) => {
    return (
      label.normalizedMidPoint.x < leftColumnThreshold &&
      label.text.match(oneOrTwoDigitNumberRegex)
    );
  });

  const rightColumnLabels = normalizedLabels.filter((label) => {
    return (
      label.normalizedMidPoint.x > rightColumnThreshold &&
      label.text.match(oneOrTwoDigitNumberRegex)
    );
  });

  const topColumnLabels = normalizedLabels.filter((label) => {
    return (
      label.normalizedMidPoint.y < topColumnThreshold &&
      label.text.match(/^[A-Z]$/)
    );
  });

  return fileConnections.map((fileConnection) => {
    const normalizedMidPoint = pidDocument
      .getMidPointToPaths(fileConnection.pathIds)
      .normalize(pidDocument.viewBox);

    const isOnLeftSide = normalizedMidPoint.x < leftFileConnectionThreshold;
    if (isOnLeftSide && leftColumnLabels.length > 0) {
      const closestLeftLabel = getClosestNormalizedLabel(
        normalizedMidPoint,
        leftColumnLabels
      );
      let fileDirection: FileDirection;
      switch (fileConnection.orientation) {
        case 'Left':
          fileDirection = 'Out';
          break;
        case 'Right':
          fileDirection = 'In';
          break;
        case 'Left & Right':
          fileDirection = 'Unidirectional';
          break;
        default:
          fileDirection = 'Unknown';
      }
      return {
        ...fileConnection,
        position: `A${closestLeftLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestLeftLabel.id],
        fileDirection,
      };
    }

    const isOnRightSide = normalizedMidPoint.x > rightFileConnectionThreshold;
    if (isOnRightSide && rightColumnLabels.length > 0) {
      const closestRightLabel = getClosestNormalizedLabel(
        normalizedMidPoint,
        rightColumnLabels
      );

      let fileDirection: FileDirection;
      switch (fileConnection.orientation) {
        case 'Left':
          fileDirection = 'In';
          break;
        case 'Right':
          fileDirection = 'Out';
          break;
        case 'Left & Right':
          fileDirection = 'Unidirectional';
          break;
        default:
          fileDirection = 'Unknown';
      }

      return {
        ...fileConnection,
        position: `B${closestRightLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestRightLabel.id],
        fileDirection,
      };
    }

    const isAtTop = normalizedMidPoint.y < topFileConnectionThreshold;
    if (isAtTop && topColumnLabels.length > 0) {
      const closestTopLabel = getClosestNormalizedLabel(
        normalizedMidPoint,
        topColumnLabels
      );

      let fileDirection: FileDirection;
      switch (fileConnection.orientation) {
        case 'Up':
          fileDirection = 'Out';
          break;
        case 'Down':
          fileDirection = 'In';
          break;
        case 'Up & Down':
          fileDirection = 'Unidirectional';
          break;
        default:
          fileDirection = 'Unknown';
      }

      return {
        ...fileConnection,
        position: closestTopLabel.text,
        labelIds: [...fileConnection.labelIds, closestTopLabel.id],
        fileDirection,
      };
    }

    return {
      ...fileConnection,
      fileDirection: 'Unknown',
    };
  });
};
