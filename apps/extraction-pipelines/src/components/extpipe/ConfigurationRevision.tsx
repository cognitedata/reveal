import React from 'react';
import { useParams } from 'react-router-dom';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { PageWrapperColumn } from 'components/styled';
import { useSelectedExtpipe } from 'hooks/useExtpipe';

import ConfigurationEditor from './ConfigurationEditor';
import { ConfigurationHeading } from './ConfigurationHeading';

export default function ConfigurationRevision() {
  const { data: extpipe } = useSelectedExtpipe();
  const { revision: r } = useParams<{ revision: string }>();

  const revision = (() => {
    try {
      return parseInt(r ?? '', 10);
    } catch {
      return 0;
    }
  })();
  if (!extpipe) {
    return null;
  }
  return (
    <>
      <ExtpipeBreadcrumbs extpipe={extpipe} />
      <ConfigurationHeading
        revision={revision}
        externalId={extpipe.externalId}
      />
      <PageWrapperColumn>
        <ConfigurationEditor
          externalId={extpipe.externalId}
          revision={revision}
          isSnippet
        />
      </PageWrapperColumn>
    </>
  );
}
