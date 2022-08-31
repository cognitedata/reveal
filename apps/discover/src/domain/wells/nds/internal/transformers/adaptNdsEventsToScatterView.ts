import { ScatterViewEvent } from 'components/ScatterView';

import { NdsInternalWithTvd } from '../types';

export const adaptNdsEventsToScatterView = (
  nptEvents: NdsInternalWithTvd[]
): ScatterViewEvent<NdsInternalWithTvd>[] => {
  // create a bucket of npt codes with corresponding events.
  const ndsCodeBucket = nptEvents.reduce((buckets, item) => {
    if (!item.riskType) {
      return buckets;
    }

    const stack = buckets[item.riskType] || [];

    return { ...buckets, [item.riskType]: [...stack, item] };
  }, {} as Record<string, NdsInternalWithTvd[]>);

  // sort the stack in the bucket by length of items.
  const sortedBucketStacks = Object.values(ndsCodeBucket).sort(
    (a, b) => b.length - a.length
  );

  // flatten the structure, and get a sorted list of events based on npt code.
  const flatBucket = sortedBucketStacks.flat(1);

  const transformedData = flatBucket.map((event, index) => {
    const {
      riskType,
      subtype,
      severity,
      probability,
      holeStartTvd,
      holeEndTvd,
      holeDiameter,
      ndsCodeColor,
    } = event;

    return {
      id: `${riskType}-${subtype}-${holeStartTvd?.value}-${holeEndTvd?.value}-${severity}-${probability}-${index}`,
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
          title: [
            'TVD Hole Start',
            holeStartTvd?.unit && `(${holeStartTvd.unit})`,
          ]
            .filter(Boolean)
            .join(' '),
          content: holeStartTvd?.value,
        },
        {
          title: ['TVD Hole End', holeEndTvd?.unit && `(${holeEndTvd.unit})`]
            .filter(Boolean)
            .join(' '),
          content: holeEndTvd?.value,
        },
      ],
    };
  });

  return transformedData;
};
