import { Input, Title } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components/macro';

type Item = { title: string; description?: string };

export type TypeListProps = {
  items?: Item[];
  width?: number | string;
  placeholder?: string;
  onClick?: (item: Item, index: number) => void;
};

export const TypeList = ({
  width,
  items,
  placeholder,
  onClick,
}: TypeListProps) => {
  const [filter, setFilter] = useState('');
  return (
    <StyledTypeList width={width}>
      <StyledFilterContainer>
        <Input
          fullWidth
          placeholder={placeholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        ></Input>
      </StyledFilterContainer>
      <StyledItemContainer>
        {items
          ?.filter(({ title }) => title.match(new RegExp(filter, 'gi')))
          ?.map(({ title, description }, index) => (
            <StyledItem
              key={index}
              onClick={() => onClick && onClick({ title, description }, index)}
            >
              <Title level={5} color="#333333">
                {title}
              </Title>
              <Description>{description}</Description>
            </StyledItem>
          ))}
      </StyledItemContainer>
    </StyledTypeList>
  );
};

const StyledTypeList = styled.div<{ width?: number | string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: ${(props) => props.width};
  border-right: 1px solid rgba(0, 0, 0, 0.15);
`;

const StyledFilterContainer = styled.div`
  height: 56px;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
`;

const StyledItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  height: 54px;
  width: 100%;
  padding: 8px 12px;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background: rgba(74, 103, 251, 0.08);
    border-radius: 6px;
    cursor: pointer;
  }
`;

const Description = styled.p`
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
`;
