import React from 'react';
import { BooleanProfile } from 'hooks/sdk-queries';
import ProfileRow from './ProfileRow';

type Props = {
  label: string;
  profile: BooleanProfile;
  nullCount: number;
  allCount: number;
};

export default function BooleanProfileRow({
  label,
  nullCount,
  allCount,
}: Props) {
  return (
    <ProfileRow
      icon="BooleanIcon"
      allCount={allCount}
      label={label}
      nullCount={nullCount}
    />
  );
}
