import styled from 'styled-components/macro';

import mainPalette from 'styles/default.palette';
import { sizes } from 'styles/layout';

export const HeaderWrapper = styled.div`
  padding: ${sizes.small};
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  display: flex;
`;

export const HeaderContentWrapper = styled.div`
  display: -webkit-box;
  align-items: center;
  font-weight: 500;
  color: var(--cogs-text-color);
  font-size: 12px;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export const HeaderTitle = styled.div`
  display: inline-block;
  font-weight: 600;
  font-size: 14px;
  color: #262626;
  padding-left: 15px;
  border-left: 1px solid ${mainPalette.gray};
  line-height: 24px;
`;

export const BackButtonWrapper = styled.div`
  display: inline-block;
  margin-right: 10px;
`;

export const ContentWrapper = styled.div`
  height: 100%;
  background-color: var(--cogs-greyscale-grey1);

  .nds-events-expander {
    position: relative;
    flex: 1;
    width: 100% !important;
  }
`;

export const ChildWrapper = styled.div`
  height: 100%;
  background-color: var(--cogs-white);
`;
