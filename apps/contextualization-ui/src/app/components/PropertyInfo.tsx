import styled from 'styled-components';

import { Body, Chip, Icon, Tooltip } from '@cognite/cogs.js';

import { getScoreColor } from '../utils/getScoreColor';

export const PropertyInfo = ({
  columnName,
  contextualizationScore,
}: {
  columnName: string;
  contextualizationScore?: number;
}) => {
  return (
    <>
      <Body level={2}>Column:</Body>
      <GrayRectangle>
        <InnerColumnContainer>
          <InnerInnerContainer>
            <Icon type="Link" />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {columnName}
            </div>
          </InnerInnerContainer>
          {contextualizationScore !== undefined ? (
            <Chip
              hideTooltip={true}
              size="small"
              label={`${contextualizationScore} %`}
              type={getScoreColor(Number(contextualizationScore))}
            />
          ) : (
            <Tooltip content="To get a total score you need to create manual matches">
              <Chip hideTooltip={true} size="small" label="?" />
            </Tooltip>
          )}
        </InnerColumnContainer>
      </GrayRectangle>
    </>
  );
};

const GrayRectangle = styled.div`
  display: flex;
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 4px;
`;

const InnerColumnContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 8px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const InnerInnerContainer = styled.div`
  width: 85px;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
