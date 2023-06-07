import React from 'react';

import styled from 'styled-components';

import { Card, Typography } from 'antd';

import { Flex, Button, Detail } from '@cognite/cogs.js';

import FeedbackHomeIcon from './FeedbackHomeIcon';

const { Text } = Typography;

type GetFeedbackProps = {
  open: boolean | string;
  title: string;
  description?: string;
  giveFeedbackLabel: string;
  isNeverShowAgain?: boolean;
  neverShowAgainLabel?: string;
  onGiveFeedback: () => void;
  onClose: (isNeverShowAgainEnabled: boolean) => void;
};

const GetFeedback = ({
  open,
  title,
  description,
  giveFeedbackLabel,
  isNeverShowAgain = true,
  neverShowAgainLabel,
  onGiveFeedback,
  onClose,
}: GetFeedbackProps): JSX.Element => {
  return (open && open !== 'false') || open === 'true' ? (
    <Wrapper>
      <Container>
        <Flex justifyContent="space-between" alignItems="center">
          <CustomFeedbackHomeIcon />
          <InfoContainer justifyContent="space-between" alignItems="center">
            <Flex direction="column">
              <Text strong>{title}</Text>
              {description && <Detail>{description}</Detail>}
            </Flex>
            <Flex>
              <Button
                type="primary"
                onClick={onGiveFeedback}
                style={{ marginRight: '12px', backgroundColor: '#FF6918' }}
              >
                {giveFeedbackLabel}
              </Button>
              {isNeverShowAgain && (
                <Button type="secondary" onClick={() => onClose(true)}>
                  {neverShowAgainLabel}
                </Button>
              )}
            </Flex>
          </InfoContainer>
          <CloseButton
            type="ghost"
            icon="Close"
            onClick={() => onClose(false)}
          />
        </Flex>
      </Container>
    </Wrapper>
  ) : (
    <>{null}</>
  );
};

const Wrapper = styled.div`
  width: 100%;
  .ant-card-body {
    padding: 0 !important;
  }
  .ant-card-bordered {
    border-radius: 5px;
  }
`;

const Container = styled(Card)`
  width: 100%;
  margin: 12px 0 !important;
`;

const CustomFeedbackHomeIcon = styled(FeedbackHomeIcon)`
  border-radius: 5px 0 0 5px;
`;

const InfoContainer = styled(Flex)`
  flex: 1;
  padding: 0 14px 0 24px;
`;

const CloseButton = styled(Button)`
  margin-bottom: 108px !important;
`;

export default GetFeedback;
