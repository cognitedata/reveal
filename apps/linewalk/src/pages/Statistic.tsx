import React from 'react';
import styled from 'styled-components';

type StatisticProp = {
  number: number;
  title: string;
  body: string;
};

const Statistic: React.FC<StatisticProp> = ({ number, title, body }) => (
  <Container>
    <Number>{number}</Number>
    <TextContainer>
      <Title>{title}</Title>
      <Body>{body}</Body>
    </TextContainer>
  </Container>
);

export default Statistic;

const Container = styled.div`
  margin: auto;
  display: flex;
  padding: 8px;
  width: 320px;
  height: 100px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 8px;
`;

const Number = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 36px;
  line-height: 48px;
  text-align: center;
  letter-spacing: -0.02em;
  font-feature-settings: 'cv05' on, 'ss04' on;
  padding: 0 25px;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  border-right: 1px solid #d9d9d9;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const Body = styled.div`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 18px;
  /* identical to box height, or 138% */
  font-feature-settings: 'cv08' on, 'ss04' on;
  color: #000000;
`;
