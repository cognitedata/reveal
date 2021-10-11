import styled from 'styled-components/macro';

// Can't use a div containers since table row renders the childrens inside a <p>
// React DOM doesn't allow to use <div> or <p> inside the <p>
export const MiddleEllipsisTooltipContainer = styled.span`
  width: inherit;
`;

export const SpanFlex = styled.span`
  display: flex;
`;

export const MiddleEllipsisWrapper = styled.span`
  white-space: nowrap;
`;
