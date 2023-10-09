import React from 'react';
import styled from 'styled-components/macro';
import { Button } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { projectName } from '../../utils/index';
import worker13 from '../../assets/worker13.svg';

const Background = styled.div`
  background: white;
  height: 100%;
  width: 100%;
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

const Worker = styled.div`
  max-width: 90%;
  height: 70vh;
  margin-left: 15%;
  background: url(${worker13});
  background-size: contain;
  background-repeat: no-repeat;
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
    props.navigate(createLink(`/home`));
  } else {
    props.navigate('/');
  }
};

const WorkerPage = (routerFunction) => (
  <Background>
    <Worker />
    <TitleTextWorker>Nothing to see here&hellip;.</TitleTextWorker>
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
  return <WorkerPage props={props} />;
};

export default NotFound;
