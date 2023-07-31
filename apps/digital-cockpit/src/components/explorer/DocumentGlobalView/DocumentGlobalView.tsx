import { FileInfo } from '@cognite/sdk';
import noop from 'lodash/noop';

import DocumentSidebar from '../DocumentSidebar';
import OrnatePreview from '../OrnatePreview';

import { Container, Preview, Sidebar } from './elements';

export type DocumentGlobalViewProps = {
  document: FileInfo;
  onSelect?: () => void; // handle selection of an asset or a timeserie
};

const TimeSeriesGlobalView = ({
  document,
  onSelect = noop,
}: DocumentGlobalViewProps) => {
  return (
    <Container>
      <Preview>
        <OrnatePreview document={document} />
      </Preview>
      <Sidebar>
        <DocumentSidebar
          document={document}
          showPreview={false}
          showHeader={false}
          onSelect={onSelect}
        />
      </Sidebar>
    </Container>
  );
};

export default TimeSeriesGlobalView;
