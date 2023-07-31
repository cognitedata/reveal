import styled from 'styled-components';

export const Container = styled.div`
  background-color: #f9f9f9;
  margin: 24px 32px;
  display: flex;
  align-items: center;
`;

export const Card = styled.div`
  background-color: #f9f9f9;
  padding: 18px;
  text-align: center;
  position: relative;
  flex: 1 0 25%;

  &:not(:last-child):after {
    content: '';
    display: block;
    height: 32px;
    width: 0;
    border-right: 1px solid #d9d9d9;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
`;
export const Label = styled.div`
  color: rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`;
export const Value = styled.div`
  color: #595959;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  height: 24px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
