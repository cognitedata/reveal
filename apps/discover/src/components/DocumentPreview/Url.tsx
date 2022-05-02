import { MetadataItem } from 'components/MetadataTable';
import { FlexColumn } from 'styles/layout';

import { PathHeader } from './elements';

interface Props {
  url?: string;
}
export const Url: React.FC<Props> = ({ url }) => {
  if (url === undefined) {
    return null;
  }

  return (
    <FlexColumn>
      <PathHeader>Url</PathHeader>
      <MetadataItem value={url} type="url" />
    </FlexColumn>
  );
};
