import React from 'react';
import { StringProfile } from 'hooks/sdk-queries';
import ProfileRow from './ProfileRow';
import { zip } from 'lodash';

type Props = {
  label: string;
  profile: StringProfile;
  nullCount: number;
  allCount: number;
};

export default function StringProfileRow({
  label,
  profile,
  nullCount,
  allCount,
}: Props) {
  const counts = zip(...profile.valueCounts)
    .map(([value, count]) => ({
      value: value as string,
      count: count as number,
    }))
    .sort((a, b) => {
      if (a.value === '<other>') {
        return 1;
      } else if (b.value === '<other>') {
        return -1;
      } else {
        return b.count - a.count;
      }
    });
  const distribution = zip(...profile.lengthHistogram).map(
    ([length, count]) => ({
      value: length?.toString() as string,
      count: count as number,
    })
  );

  return (
    <ProfileRow
      icon="StringIcon"
      label={label}
      nullCount={nullCount}
      distinctCount={profile.distinctCount}
      counts={counts}
      distribution={distribution}
      allCount={allCount}
      min={profile.lengthRange[0]}
      max={profile.lengthRange[1]}
    />
  );
}
