import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

export const TableActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .cogs-menu-item {
    text-transform: capitalize;
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
  width: 60px;
`;
