import React from 'react';
import { Body, Row, Col, Title } from '@cognite/cogs.js';
import { staticText } from './staticText';
import { Container } from './elements';

// eslint-disable-next-line no-lone-blocks
{
  /* eslint-disable react/no-danger */
}
const Home = () => {
  const {
    heading,
    intro,
    latestRelease,
    upcoming,
    gettingStarted,
  } = staticText;
  return (
    <Container>
      <div>
        <Title level={1}>{heading}</Title>
        <Body level={1} dangerouslySetInnerHTML={{ __html: intro }} />
      </div>
      <Row gutter={32}>
        <Col span={12}>
          <h2>{latestRelease.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: latestRelease.text }} />
        </Col>
        <Col span={12}>
          <h2>{upcoming.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: upcoming.text }} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <h2>{gettingStarted.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: gettingStarted.text }} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
