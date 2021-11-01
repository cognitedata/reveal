import { Input, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const InputRow = styled.div`
  margin: 12px 0;
  width: fit-content;
  display: flex;
  gap: 12px;
`;
export const InputFullWidth = styled(Input)`
  width: 250px;
`;
export const InputArea = styled.div`
  margin: 20px 0;
  padding: 24px;
  border: 2px solid #bfbfbf;
  border-radius: 6px;
  position: relative;
`;
export const InputAreaTitle = styled(Title)`
  position: absolute;
  padding-right: 10px;
  padding-left: 10px;
  top: -17px;
  background-color: white;
`;
export const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
`;

export const SelectLabel = styled.div`
  display: block;
  margin-bottom: 4px;
  color: var(--cogs-greyscale-grey8);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-transform: capitalize;
`;
