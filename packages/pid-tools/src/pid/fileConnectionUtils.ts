import {
  angleDifference,
  approxeq,
  BoundingBox,
  LineSegment,
  Point,
} from '../geometry';
import { PidFileConnectionInstance, Rect, FileDirection } from '../types';

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

const directionAngles = {
  Left: 180,
  Up: 270, // note that positive Y direction is downwards
  Right: 0,
};

const getBestFitLabel = (
  boundingBox: BoundingBox,
  normalizedLabels: NormalizedLabel[],
  expectedDirection: 'Left' | 'Up' | 'Right'
): NormalizedLabel | null => {
  let closestLabel: NormalizedLabel | null = null;
  let minDistance = Infinity;

  const midPoint = boundingBox.midPoint();
  normalizedLabels.forEach((label) => {
    // Inside a file connection there can be numbers or letters that should
    // not be used to infer position
    if (boundingBox.encloses(label.normalizedMidPoint)) return;

    const distance = boundingBox.midPoint().distance(label.normalizedMidPoint);
    const { angle } = new LineSegment(midPoint, label.normalizedMidPoint);

    if (
      distance < minDistance &&
      approxeq(
        angleDifference(angle, directionAngles[expectedDirection], 'directed'),
        0,
        10
      )
    ) {
      closestLabel = label;
      minDistance = distance;
    }
  });

  return closestLabel;
};

const isHorizontalDirection = (direction: number): boolean =>
  approxeq(angleDifference(direction, 0, 'uniDirected'), 10);

const isVerticalDirection = (direction: number): boolean =>
  approxeq(angleDifference(direction, 90, 'uniDirected'), 10);

const isUp = (direction: number): boolean => approxeq(direction, 90, 10);
const isLeft = (direction: number): boolean => approxeq(direction, 180, 10);

export const getFileConnectionsWithPosition = (
  pidDocument: PidDocument,
  fileConnections: PidFileConnectionInstance[]
): PidFileConnectionInstance[] => {
  const leftColumnThreshold = 0.1;
  const leftFileConnectionThreshold = 0.2;
  const rightColumnThreshold = 0.9;
  const rightFileConnectionThreshold = 0.8;
  const topColumnThreshold = 0.1;
  const topFileConnectionThreshold = 0.2;

  const oneOrTwoDigitNumberRegex = /^[0-9]{1,2}$/;

  const normalizedLabels = normalizeLabels(
    pidDocument.pidLabels,
    pidDocument.viewBox
  );

  const leftColumnLabels = normalizedLabels.filter(
    (label) =>
      label.normalizedMidPoint.x < leftColumnThreshold &&
      label.text.match(oneOrTwoDigitNumberRegex)
  );

  const rightColumnLabels = normalizedLabels.filter(
    (label) =>
      label.normalizedMidPoint.x > rightColumnThreshold &&
      label.text.match(oneOrTwoDigitNumberRegex)
  );

  const topColumnLabels = normalizedLabels.filter(
    (label) =>
      label.normalizedMidPoint.y < topColumnThreshold &&
      label.text.match(/^[A-Z]$/)
  );

  return fileConnections.map((fileConnection) => {
    const normalizedBoundingBox = BoundingBox.fromPidPaths(
      fileConnection.pathIds.map((id) => pidDocument.getPidPathById(id)!)
    ).normalize(pidDocument.viewBox);

    const isOnLeftSide = normalizedBoundingBox.x < leftFileConnectionThreshold;
    if (
      isOnLeftSide &&
      leftColumnLabels.length > 0 &&
      isHorizontalDirection(fileConnection.direction)
    ) {
      const closestLeftLabel = getBestFitLabel(
        normalizedBoundingBox,
        leftColumnLabels,
        'Left'
      );
      if (closestLeftLabel === null)
        return { ...fileConnection, fileDirection: 'Unknown' };

      let fileDirection: FileDirection;
      if (fileConnection.type === 'Bypass connection') {
        fileDirection = 'Unidirectional';
      } else if (isLeft(fileConnection.direction)) {
        fileDirection = 'Out';
      } else {
        fileDirection = 'In';
      }
      return {
        ...fileConnection,
        position: `A${closestLeftLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestLeftLabel.id],
        fileDirection,
      };
    }

    const isOnRightSide =
      normalizedBoundingBox.x > rightFileConnectionThreshold;
    if (
      isOnRightSide &&
      rightColumnLabels.length > 0 &&
      isHorizontalDirection(fileConnection.direction)
    ) {
      const closestRightLabel = getBestFitLabel(
        normalizedBoundingBox,
        rightColumnLabels,
        'Right'
      );
      if (closestRightLabel === null)
        return { ...fileConnection, fileDirection: 'Unknown' };

      let fileDirection: FileDirection;
      if (fileConnection.type === 'Bypass connection') {
        fileDirection = 'Unidirectional';
      } else if (isLeft(fileConnection.direction)) {
        fileDirection = 'In';
      } else {
        fileDirection = 'Out';
      }

      return {
        ...fileConnection,
        position: `B${closestRightLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestRightLabel.id],
        fileDirection,
      };
    }

    const isAtTop = normalizedBoundingBox.y < topFileConnectionThreshold;
    if (
      isAtTop &&
      topColumnLabels.length > 0 &&
      isVerticalDirection(fileConnection.direction)
    ) {
      const closestTopLabel = getBestFitLabel(
        normalizedBoundingBox,
        topColumnLabels,
        'Up'
      );
      if (closestTopLabel === null)
        return { ...fileConnection, fileDirection: 'Unknown' };

      let fileDirection: FileDirection;
      if (fileConnection.type === 'Bypass connection') {
        fileDirection = 'Unidirectional';
      } else if (isUp(fileConnection.direction)) {
        fileDirection = 'Out';
      } else {
        fileDirection = 'In';
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
