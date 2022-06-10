import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';

export const SearchInputWrapper = styled.div`
  width: 100%;
  display: flex;
  border: 3px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px 7px;
  color: #1e1e1e;
`;

export const SearchInput = styled.input`
  height: 100%;
  outline: none;
  border: none;
  width: 100%;
  padding: 1px 5px;
  border-radius: 6px;
`;

export const SearchButton = styled(Button)`
  width: 100%;
  background: #dadada;
  border: ${sizes.extraSmall} white solid;
  color: #aeaeae;
  justify-content: left;
  min-height: ${sizes.large};
`;
