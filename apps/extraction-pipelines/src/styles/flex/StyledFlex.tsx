import styled from 'styled-components';

interface DivFlexProps {
  direction?: 'row' | 'column';
  justify?:
    | 'center'
    | 'space-between'
    | 'flex-end'
    | 'flex-start'
    | 'space-around';
  align?: 'flex-end' | 'flex-start' | 'center' | 'baseline' | 'stretch';
}

export const DivFlex = styled.div`
  display: flex;
  flex-direction: ${(props: DivFlexProps) => props.direction || 'row'};
  justify-content: ${(props: DivFlexProps) => props.justify || 'start'};
  align-items: ${(props: DivFlexProps) => props.align || 'center'};
`;
