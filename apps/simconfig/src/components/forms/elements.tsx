import { Input, Switch, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const InputRow = styled.div`
  margin: 12px 0;
  width: fit-content;
  display: flex;
  gap: 12px;
`;
export const InputInfoRow = styled.div`
  width: fit-content;
  display: flex;
  gap: 6px;
`;
export const DoubleInputRow = styled.div`
  display: flex;
  width: 300px;

  > * {
    &.cogs-select {
      flex: 1;
    }
  }
`;

export const InputFullWidth = styled(Input)`
  width: ${(props) => props.width || '300px'};
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
export const SectionTitle = styled(Title)`
  text-transform: uppercase;
  margin-bottom: 30px;
`;

export const InputAreaSwitch = styled(Switch)`
  margin-left: 5px;
`;
export const InputWithLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
`;

export const InputLabel = styled.div`
  display: block;
  margin-bottom: 4px;
  color: var(--cogs-greyscale-grey8);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-transform: capitalize;
`;
