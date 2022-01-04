import { Button, Skeleton } from '@cognite/cogs.js';
import { APIResponse, ScarletDocument } from 'modules/scarlet/types';

import * as Styled from './style';

type TopBarProps = {
  equipmentName: string;
  documentsQuery: APIResponse<ScarletDocument[]>;
};

export const TopBar = ({ equipmentName, documentsQuery }: TopBarProps) => (
  <Styled.Container>
    <Button icon="ArrowLeft">Back</Button>
    <Styled.Title level={3}>{equipmentName}</Styled.Title>
    {documentsQuery.loading && (
      <Skeleton.Rectangle width="90px" height="24px" />
    )}
    {!(documentsQuery.loading || documentsQuery.error) && (
      <Styled.DocumentsAmount>
        {documentsQuery.data?.length}
        {documentsQuery.data?.length === 1 ? ' document' : ' documents'}
      </Styled.DocumentsAmount>
    )}
  </Styled.Container>
);
