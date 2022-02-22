import styled from 'styled-components/macro';

import {
  FlexRow,
  FlexShrinkWrap,
  FlexColumn,
  sizes,
  Ellipsis,
} from 'styles/layout';

export const MetadataTableContainer = styled(FlexRow, FlexShrinkWrap)`
  display: grid;
  grid-template-columns: ${(props: { columns: number }) =>
    props.columns ? `repeat(${props.columns}, 1fr)` : `repeat(4, 1fr)`};
  gap: 0 ${sizes.normal};
`;

export const TitleStyle = styled.div`
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
`;

export const Label = styled(TitleStyle)`
  user-select: none;
  color: var(--cogs-greyscale-grey9);
  font-weight: 500;
  margin-bottom: ${sizes.extraSmall};
`;

export const Value = styled(TitleStyle)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--cogs-greyscale-grey9);
  font-weight: 400;
`;

export const OriginalPathValue = styled(Value)``;

export const MetadataContainer = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${({ spacing }: { spacing: keyof typeof sizes }) =>
    sizes[spacing || 'normal']};

  span {
    line-height: ${sizes.normal};
  }
`;

export const ActionContainer = styled(FlexRow)`
  padding: 16px 24px;

  & > * {
    margin-right: 10px;
  }
`;

export const TextContainer = styled.div`
  background-color: #f3f3f3;
  padding: ${sizes.small} 12px;
  line-height: 20px;
  cursor: ${(props: any) => (props.showCursor ? 'pointer' : 'default')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 4px;
`;

export const PathContainer = styled(TextContainer)`
  padding: ${sizes.extraSmall} ${sizes.small};
`;

export const PathText = styled(TitleStyle)`
  font-weight: 400;
  margin: 0;
  color: var(--cogs-greyscale-grey7);
  margin-right: ${sizes.normal};
  ${Ellipsis};
`;

export const EmptyCell = styled.span`
  user-select: none;
  color: var(--cogs-text-hint);
`;
