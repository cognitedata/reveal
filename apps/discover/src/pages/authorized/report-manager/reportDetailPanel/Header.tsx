import styled from 'styled-components/macro';

import { Title, Button } from '@cognite/cogs.js';

const Header = styled.div`
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--cogs-color-strokes-default);
`;

export const ReportDetailHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <Header>
      <Title level={5}>Report</Title>
      <div>
        <Button
          block
          icon="Close"
          type="ghost"
          aria-label="Close"
          onClick={onClose}
          style={{ marginRight: '8px' }}
        />
      </div>
    </Header>
  );
};
