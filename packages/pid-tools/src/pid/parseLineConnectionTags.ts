import minBy from 'lodash/minBy';

import {
  AUTO_ANALYSIS_LINE_CONNECTION_TAG_THRESHOLD,
  LINE_CONNECTION_LETTER_REGEX,
} from '../constants';
import { BoundingBox } from '../geometry';
import { DiagramLineConnectionTag } from '../types';
import { getLineNumberAndUnitFromText } from '../utils';

import { PidDocument } from './PidDocument';

const parseLineConnectionTags = (pidDocument: PidDocument) => {
  const tags: DiagramLineConnectionTag[] = [];

  const sameOrLineNumberLabels = pidDocument.pidLabels.filter(
    (pidLabel) =>
      pidLabel.text.includes('SAME') ||
      getLineNumberAndUnitFromText(pidLabel.text).lineNumber
  );
  const letterLabels = pidDocument.pidLabels.filter((pidLabel) =>
    pidLabel.text.match(LINE_CONNECTION_LETTER_REGEX)
  );

  const distanceThreshold =
    pidDocument.viewBox.width * AUTO_ANALYSIS_LINE_CONNECTION_TAG_THRESHOLD;

  for (let i = 0; i < sameOrLineNumberLabels.length; i++) {
    const sameOrLineNumberLabel = sameOrLineNumberLabels[i];

    const potLabelWithDistance = minBy(
      letterLabels.map((label) => {
        return {
          label,
          distance: BoundingBox.fromRect(label.boundingBox).distance(
            BoundingBox.fromRect(sameOrLineNumberLabel.boundingBox)
          ),
        };
      }),
      (labelAndDistance) => labelAndDistance.distance
    );

    // eslint-disable-next-line no-continue
    if (potLabelWithDistance === undefined) continue;

    const { distance } = potLabelWithDistance;
    const potLabel = potLabelWithDistance.label;

    if (distance < distanceThreshold) {
      const newTag: DiagramLineConnectionTag = {
        id: `lcTag-${sameOrLineNumberLabel.id}-${potLabel.id}`,
        labelIds: [sameOrLineNumberLabel.id, potLabel.id],
        type: 'Line Connection Tag',
        lineNumbers: [],
        inferedLineNumbers: [],
      };
      tags.push(newTag);
    }
  }

  return tags;
};

export default parseLineConnectionTags;
