import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { projectName } from 'utils';
import worker13 from 'assets/worker13.svg';
import sg15 from 'assets/sg15.svg';

const Background = styled.div`
  background: white;
  height: 100%;
  width: 100%;
`;

const TitleTextSG = styled.h1`
  font-weight: lighter;
  font-size: 36px;
  margin-left: 12%;
  padding-top: 5%;
  color: #000000;
`;

const TitleTextWorker = styled.h1`
  font-weight: lighter;
  font-size: 36px;
  margin-left: 12%;
  color: #000000;
  margin-top: -10%;
`;

const TextParagraphWorker = styled.div`
  max-width: 300px;
  text-align: justify;
  margin-left: 15%;
  color: #000000;
`;
const TextParagraphSG = styled.div`
  max-width: 300px;
  text-align: justify;
  margin-left: 13%;
  color: #000000;
`;

const SpaceGirl = styled.div`
  max-width: 90%;
  height: 70vh;
  margin-left: 12%;
  background: url(${sg15});
  background-size: contain;
  background-repeat: no-repeat;
`;

const Worker = styled.div`
  max-width: 90%;
  height: 70vh;
  margin-left: 15%;
  background: url(${worker13});
  background-size: contain;
  background-repeat: no-repeat;
`;

const BackButtonSG = styled(Button)`
  background: #2d1ed7;
  font-size: 16px;
  margin-left: 20%;
  width: 100px;
  margin-top: 20px;
  color: #ffffff;
  border: none;
  outline: none;
`;

const BackButtonWorker = styled(Button)`
  background: #2d1ed7;
  font-size: 16px;
  margin-left: 25%;
  width: 100px;
  margin-bottom: 100px;
  color: #ffffff;
  border: none;
  outline: none;
`;

const goBackOnClick = (props) => {
  if (projectName) {
    props.history.push(createLink(`/home`));
  } else {
    props.history.push('/');
  }
};

const SGPage = (routerFunction) => (
  <Background>
    <TitleTextSG>Nothing to see here...</TitleTextSG>
    <TextParagraphSG>
      The page you are trying to read does not exist. Please check your URL, or
      go back to the previous page.
    </TextParagraphSG>
    <BackButtonSG
      type="primary"
      onClick={() => goBackOnClick(routerFunction.props)}
    >
      Back
    </BackButtonSG>
    <SpaceGirl />
  </Background>
);

const WorkerPage = (routerFunction) => (
  <Background>
    <Worker />
    <TitleTextWorker>Nothing to see here....</TitleTextWorker>
    <TextParagraphWorker>
      The page you are trying to read does not exist. Please check your URL, or
      go back to the previous page.
    </TextParagraphWorker>
    <BackButtonWorker
      type="primary"
      onClick={() => goBackOnClick(routerFunction.props)}
    >
      Back
    </BackButtonWorker>
  </Background>
);

const NotFound = (props) => {
  const max = 10;
  const rand = Math.floor(Math.random() * Math.floor(max));
  if (rand % 2 === 0) {
    return <SGPage props={props} />;
  }

  return <WorkerPage props={props} />;
};

export default withRouter(NotFound);
