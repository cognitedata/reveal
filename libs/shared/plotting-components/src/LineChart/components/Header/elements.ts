import styled from 'styled-components/macro';

import { SUBTITLE_COLOR, TITLE_COLOR } from '../../constants';

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

export const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: ${TITLE_COLOR};
`;

export const ChartSubtitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: ${SUBTITLE_COLOR};
`;
