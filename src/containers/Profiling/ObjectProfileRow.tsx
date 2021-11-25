import React from 'react';
import { ObjectProfile } from 'hooks/sdk-queries';
import ProfileRow from './ProfileRow';

type Props = {
  label: string;
  profile: ObjectProfile;
  nullCount: number;
  allCount: number;
};

export default function ObjectProfileRow({
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
      min={profile.keyCountRange[0]}
      max={profile.keyCountRange[1]}
    />
  );
}
