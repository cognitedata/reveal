import React from 'react';

import { useMissingPermissions } from '@interactive-diagrams-app/hooks/usePermissions';
import NoAccess from '@interactive-diagrams-app/pages/NoAccess';

export default function GroupsRequired(props: { children: JSX.Element }) {
  const missingPermissions = useMissingPermissions();

  if (!missingPermissions?.length) {
    return props.children;
  }
  return <NoAccess missingPermissions={missingPermissions} />;
}
