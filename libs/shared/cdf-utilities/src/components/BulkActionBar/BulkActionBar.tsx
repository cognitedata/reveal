import React, { useRef } from 'react';

import styled from 'styled-components';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { TOOLTIP_DELAY_IN_MS } from '@cognite/cdf-utilities';
import {
  Button,
  ButtonProps,
  Colors,
  Detail,
  Elevations,
  Title,
  Tooltip,
} from '@cognite/cogs.js';

type BulkActionBarProps = {
  actions: Omit<ButtonProps, 'variant'>[];
  closeButtonTooltip: string;
  detail?: string;
  onClose: () => void;
  title: string;
};

const BulkActionBar = ({
  actions,
  closeButtonTooltip,
  detail,
  onClose,
  title,
}: BulkActionBarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <StyledActionBarContainer ref={ref}>
      <StyledActionBarInfo>
        <StyledActionBarTitle>{title}</StyledActionBarTitle>
        {detail && <StyledActionBarDetail>{detail}</StyledActionBarDetail>}
      </StyledActionBarInfo>
      <StyledActionBarButtonGroup>
        <StyledActionBarDivider />
        {actions.map((props) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <Button
            key={JSON.stringify(props)}
            type="ghost"
            inverted
            {...props}
          />
        ))}
        <StyledActionBarDivider />
        <Tooltip
          appendTo={ref.current || undefined}
          content={closeButtonTooltip}
          delay={TOOLTIP_DELAY_IN_MS}
          css={{ transform: 'translateY(-8px)' }}
        >
          <Button
            icon="Close"
            onClick={onClose}
            aria-label={closeButtonTooltip}
            type="ghost"
            inverted
          />
        </Tooltip>
      </StyledActionBarButtonGroup>
    </StyledActionBarContainer>
  );
};

const StyledActionBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  inset: auto 40px 24px;
  height: 56px;
  padding: 0px 16px;
  background-color: ${Colors['text-icon--strong']};
  box-shadow: ${Elevations['elevation--surface--interactive']};
  border-radius: 12px;
`;

const StyledActionBarInfo = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: column;
`;

const StyledActionBarTitle = styled(Title).attrs({
  level: 5,
})`
  &&& {
    color: ${Colors['text-icon--strong--inverted']};
  }
`;

const StyledActionBarDetail = styled(Detail).attrs({
  strong: true,
})`
  &&& {
    color: ${Colors['text-icon--muted--inverted']};
  }
`;

const StyledActionBarButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledActionBarDivider = styled.div`
  width: 2px;
  height: 20px;
  background: ${Colors['surface--misc-backdrop']};
  border-radius: 4px;
`;

export default BulkActionBar;
