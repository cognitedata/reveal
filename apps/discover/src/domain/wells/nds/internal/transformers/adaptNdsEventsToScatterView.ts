// import { getDateOrDefaultText } from 'utils/date';

import { ScatterViewEvent } from 'components/ScatterView';

import { NdsInternal } from '../types';

export const adaptNdsEventsToScatterView = (
  nptEvents: NdsInternal[]
): ScatterViewEvent<NdsInternal>[] => {
  // create a bucket of npt codes with corresponding events.
  const ndsCodeBucket = nptEvents.reduce((buckets, item) => {
    if (!item.riskType) {
      return buckets;
    }

    const stack = buckets[item.riskType] || [];

    return { ...buckets, [item.riskType]: [...stack, item] };
  }, {} as Record<string, NdsInternal[]>);

  // sort the stack in the bucket by length of items.
  const sortedBucketStacks = Object.values(ndsCodeBucket).sort(
    (a, b) => b.length - a.length
  );

  // flatten the structure, and get a sorted list of events based on npt code.
  const flatBucket = sortedBucketStacks.flat(1);

  const transformedData = flatBucket.map((event) => {
    const {
      riskType,
      subtype,
      holeStart,
      severity,
      probability,
      holeEnd,
      holeDiameter,
      ndsCodeColor,
    } = event;

    return {
      id: `${riskType}-${subtype}-${holeStart?.value}-${holeEnd?.value}-${severity}-${probability}`,
      dotColor: ndsCodeColor,
      original: event,
      metadata: [
        {
          title: riskType,
          content: subtype,
          color: ndsCodeColor,
          layout: {
            extendedWidth: true,
          },
        },
        {
          title: 'Severity',
          content: severity,
        },
        {
          title: 'Probability',
          content: probability,
        },
        {
          title: ['Diameter', holeDiameter?.unit && `(${holeDiameter.unit})`]
            .filter(Boolean)
            .join(' '),
          content: holeDiameter?.value,
        },
        {
          title: ['TVD Hole Start', holeStart?.unit && `(${holeStart.unit})`]
            .filter(Boolean)
            .join(' '),
          content: holeStart?.value,
        },
        {
          title: ['TVD Hole End', holeEnd?.unit && `(${holeEnd.unit})`]
            .filter(Boolean)
            .join(' '),
          content: holeEnd?.value,
        },
      ],
    };
  });

  return transformedData;
};
