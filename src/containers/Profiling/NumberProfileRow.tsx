import React from 'react';
import { NumberProfile } from 'hooks/sdk-queries';
import ProfileRow from './ProfileRow';

type Props = {
  label: string;
  profile: NumberProfile;
  nullCount: number;
  allCount: number;
};

export default function NumberProfileRow({
  label,
  profile,
  nullCount,
  allCount,
}: Props) {
  return (
    <ProfileRow
      icon="NumberIcon"
      allCount={allCount}
      label={label}
      nullCount={nullCount}
      distinctCount={profile.distinctCount}
      min={profile.valueRange[0]}
      max={profile.valueRange[1]}
    />
  );
}
