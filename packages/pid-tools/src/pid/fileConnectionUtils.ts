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

const DirectionAngle = {
  Right: 0,
  Down: 90,
  Left: 180,
  Up: 270, // note that positive Y direction is downwards
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
    // Inside a File Connection there can be numbers or letters that should
    // not be used to infer position
    if (boundingBox.encloses(label.normalizedMidPoint)) return;

    const distance = boundingBox.midPoint().distance(label.normalizedMidPoint);
    const { angle } = new LineSegment(midPoint, label.normalizedMidPoint);

    if (
      distance < minDistance &&
      approxeq(
        angleDifference(angle, DirectionAngle[expectedDirection], 'directed'),
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

export const isHorizontal = (direction: number): boolean =>
  approxeq(
    angleDifference(direction, DirectionAngle.Right, 'uniDirected'),
    0,
    10
  );

export const isVertical = (direction: number): boolean =>
  approxeq(angleDifference(direction, DirectionAngle.Up, 'uniDirected'), 0, 10);

export const isUp = (direction: number): boolean =>
  approxeq(angleDifference(direction, DirectionAngle.Up, 'directed'), 0, 10);

export const isDown = (direction: number): boolean =>
  approxeq(angleDifference(direction, DirectionAngle.Down, 'directed'), 0, 10);

export const isLeft = (direction: number): boolean =>
  approxeq(angleDifference(direction, DirectionAngle.Left, 'directed'), 0, 10);

export const isRight = (direction: number): boolean =>
  approxeq(angleDifference(direction, DirectionAngle.Right, 'directed'), 0, 10);

export const getFileConnectionsWithPosition = (
  pidDocument: PidDocument,
  fileConnections: PidFileConnectionInstance[]
): PidFileConnectionInstance[] => {
  const leftColumnThreshold = 0.1;
  const rightColumnThreshold = 0.9;
  const topColumnThreshold = 0.1;

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

    const isOnLeftSide = normalizedBoundingBox.x < 0.5;
    if (isOnLeftSide && isHorizontal(fileConnection.direction)) {
      let fileDirection: FileDirection | undefined;
      if (fileConnection.type === 'Bypass Connection') {
        fileDirection = 'Unidirectional';
      } else if (isLeft(fileConnection.direction)) {
        fileDirection = 'Out';
      } else if (isRight(fileConnection.direction)) {
        fileDirection = 'In';
      }

      const closestLeftLabel = getBestFitLabel(
        normalizedBoundingBox,
        leftColumnLabels,
        'Left'
      );
      if (closestLeftLabel === null)
        return { ...fileConnection, fileDirection };

      return {
        ...fileConnection,
        position: `A${closestLeftLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestLeftLabel.id],
        fileDirection,
      };
    }

    const isOnRightSide = normalizedBoundingBox.x > 0.5;
    if (isOnRightSide && isHorizontal(fileConnection.direction)) {
      let fileDirection: FileDirection | undefined;
      if (fileConnection.type === 'Bypass Connection') {
        fileDirection = 'Unidirectional';
      } else if (isLeft(fileConnection.direction)) {
        fileDirection = 'In';
      } else if (isRight(fileConnection.direction)) {
        fileDirection = 'Out';
      }

      const closestRightLabel = getBestFitLabel(
        normalizedBoundingBox,
        rightColumnLabels,
        'Right'
      );
      if (closestRightLabel === null)
        return { ...fileConnection, fileDirection };

      return {
        ...fileConnection,
        position: `B${closestRightLabel.text}`,
        labelIds: [...fileConnection.labelIds, closestRightLabel.id],
        fileDirection,
      };
    }

    const isAtTop = normalizedBoundingBox.y < 0.5;
    if (isAtTop && isVertical(fileConnection.direction)) {
      let fileDirection: FileDirection | undefined;
      if (fileConnection.type === 'Bypass Connection') {
        fileDirection = 'Unidirectional';
      } else if (isUp(fileConnection.direction)) {
        fileDirection = 'Out';
      } else if (isDown(fileConnection.direction)) {
        fileDirection = 'In';
      }

      const closestTopLabel = getBestFitLabel(
        normalizedBoundingBox,
        topColumnLabels,
        'Up'
      );
      if (closestTopLabel === null)
        return { ...fileConnection, fileDirection: 'Unknown' };

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
