import React from 'react';

import { useMissingPermissions } from '../hooks';
import NoAccessPage from '../pages/NoAccess';

export default function GroupsRequired(props: { children: JSX.Element }) {
  const missingPermissions = useMissingPermissions();

  if (!missingPermissions?.length) {
    return props.children;
  }
  return <NoAccessPage missingPermissions={missingPermissions} />;
}
