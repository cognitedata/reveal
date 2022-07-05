import { Input } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Container = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  align-items: center;
`;

export const FiltersContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-grow: 1;
`;

export const Search = styled(Input)`
  width: 220px;
  flex-shrink: 0;
`;

export const NumberEquipments = styled.div`
  margin-left: auto;
  color: rgba(0, 0, 0, 0.7);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;
