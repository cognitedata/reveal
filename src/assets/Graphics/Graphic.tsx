import React from 'react';
import styled from 'styled-components';
import SearchEmpty from './EmptyStates/SearchEmpty';

export enum GraphicOptions {
  Search = 'search',
}

export const Graphic = ({ type }: { type: GraphicOptions }) => {
  switch (type) {
    case GraphicOptions.Search:
    default:
      return (
        <Wrapper>
          <SearchEmpty />
        </Wrapper>
      );
  }
};

const Wrapper = styled.div`
  width: 150px;
  height: 150px;
`;
