import React from 'react';
import { VectorProfile } from 'hooks/sdk-queries';
import ProfileRow from './ProfileRow';

type Props = {
  label: string;
  profile: VectorProfile;
  nullCount: number;
  allCount: number;
};

export default function VectorProfileRow({
  label,
  nullCount,
  allCount,
  profile,
}: Props) {
  return (
    <ProfileRow
      allCount={allCount}
      label={label}
      nullCount={nullCount}
      min={profile.lengthRange[0]}
      max={profile.lengthRange[1]}
    />
  );
}
