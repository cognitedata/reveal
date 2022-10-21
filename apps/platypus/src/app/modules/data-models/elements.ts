import { StyledPageWrapper } from '@platypus-app/components/Layouts/elements';
import styled from 'styled-components/macro';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Row } from '@cognite/cogs.js';

const dataModelListWidth = 1020;

export const StyledDataModelListWrapper = styled(StyledPageWrapper)`
  width: ${dataModelListWidth}px;
  margin: 0 auto;

  @media only screen and (max-width: ${dataModelListWidth}px) {
    width: 670px;
  }

  .header {
    width: 100%;
    margin: 64px 0 30px 0;
  }

  .emptyList {
    margin: 100px auto;
    text-align: center;
  }
`;

export const StyledModalDialog = styled(ModalDialog)`
  .confirmDelete {
    margin: 15px 0 0 0;
  }

  .confirmDeleteText,
  .cogs-checkbox {
    cursor: pointer;
  }
`;

export const StyledRow = styled(Row)`
  padding: 2px;
  padding-bottom: 24px;
  overflow: auto;
  @media only screen and (max-width: ${dataModelListWidth}px) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
`;
