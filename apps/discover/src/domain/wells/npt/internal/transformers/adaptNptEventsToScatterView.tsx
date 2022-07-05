import { getDateOrDefaultText } from 'utils/date';

import { ScatterViewEvent } from 'components/ScatterView';

import { NptInternal } from '../types';

export const adaptNptEventsToScatterView = (
  nptEvents: NptInternal[]
): ScatterViewEvent[] => {
  // create a bucket of npt codes with corresponding events.
  const nptCodeBucket = nptEvents.reduce((bucket, item) => {
    const stack = bucket[item.nptCode] || [];

    return { ...bucket, [item.nptCode]: [...stack, item] };
  }, {} as Record<string, NptInternal[]>);

  // sort the stack in the bucket by length of items.
  const sortedBucketStacks = Object.values(nptCodeBucket).sort(
    (a, b) => b.length - a.length
  );

  // flatten the structure, and get a sorted list of events based on npt code.
  const flatBucket = sortedBucketStacks.flat(1);

  const transformedData = flatBucket.map((event) => {
    const {
      nptCode,
      nptCodeDetail,
      measuredDepth,
      startTime,
      endTime,
      duration,
      nptCodeColor,
    } = event;

    return {
      id: `${nptCode}-${nptCodeDetail}-${measuredDepth?.value}-${startTime}-${endTime}`,
      dotColor: nptCodeColor,
      metadata: [
        {
          title: nptCode,
          content: nptCodeDetail,
          color: nptCodeColor,
          layout: {
            extendedWidth: true,
          },
        },
        {
          title: ['Depth', measuredDepth?.unit && `(${measuredDepth.unit})`]
            .filter(Boolean)
            .join(' '),
          content: measuredDepth?.value,
        },
        {
          title: 'Start date',
          content: getDateOrDefaultText(startTime),
        },
        {
          title: 'End date',
          content: getDateOrDefaultText(endTime),
        },
        {
          title: 'Duration (hrs)',
          content: duration,
        },
      ],
    } as ScatterViewEvent;
  });

  return transformedData;
};
