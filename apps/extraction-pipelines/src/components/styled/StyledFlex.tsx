import styled from 'styled-components';

export interface DivFlexProps {
  direction?: 'row' | 'column';
  justify?:
    | 'center'
    | 'space-between'
    | 'flex-end'
    | 'flex-start'
    | 'space-around';
  align?: 'flex-end' | 'flex-start' | 'center' | 'baseline' | 'stretch';
  content?: 'flex-end' | 'flex-start' | 'center' | 'baseline' | 'stretch';
  self?: 'flex-end' | 'flex-start' | 'center' | 'baseline' | 'stretch';
  gap?: string;
}

export const DivFlex = styled.div<DivFlexProps>`
  display: flex;
  gap: ${(props) => props.gap || '0'};
  flex-direction: ${(props) => props.direction || 'row'};
  justify-content: ${(props) => props.justify || 'start'};
  align-items: ${(props) => props.align || 'center'};
  align-content: ${(props) => props.content || 'center'};
`;
