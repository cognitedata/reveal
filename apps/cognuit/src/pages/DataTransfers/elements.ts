import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

export const TableActionsContainer = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .cogs-menu-item {
    text-transform: capitalize;
  }
`;

export const ColumnsSelector = styled.div`
  margin-left: auto;
  align-self: flex-end;
  margin-bottom: 1rem;

  > div {
    margin-top: 2rem;
  }
`;

export const DetailViewWrapper = styled.div`
  .cogs-modal-footer-buttons {
    .cogs-btn.cogs-btn-secondary {
      display: none;
    }
  }
`;

export const StatusDot = styled.div<{ bgColor: string }>`
  border-radius: 50%;
  width: 0.7rem;
  height: 0.7rem;
  background-color: ${(props) => props.bgColor};
  margin: 0 auto;
`;

export const DetailButton = styled(Button)`
  width: 150px;
`;
