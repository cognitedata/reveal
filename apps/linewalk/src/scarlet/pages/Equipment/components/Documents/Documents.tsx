import { APIResponse, ScarletDocument } from 'modules/scarlet/types';

import { Ornate } from '..';

import * as Styled from './style';

type DocumentsProps = {
  documentsQuery: APIResponse<ScarletDocument[]>;
};

export const Documents = ({ documentsQuery }: DocumentsProps) => {
  return (
    <Styled.Container>
      <Styled.OrnateContainer>
        <Ornate documents={documentsQuery?.data} />
      </Styled.OrnateContainer>
    </Styled.Container>
  );
};
