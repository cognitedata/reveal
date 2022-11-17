import { Button } from '@cognite/cogs.js';
import { callScarletScanner } from 'api';
import { useApi } from 'hooks';

import * as Styled from './style';

export const DocumentScanTrigger = ({ documentId }: { documentId: number }) => {
  const { state, trigger: triggerDocumentScans } = useApi(
    callScarletScanner,
    { documentId },
    { skip: true }
  );

  return (
    <Styled.Container>
      <Button
        type="tertiary"
        size="default"
        aria-label="Scan Document"
        onClick={triggerDocumentScans}
        loading={state.loading}
        disabled={state.loading}
      >
        Scan Document
      </Button>
    </Styled.Container>
  );
};
