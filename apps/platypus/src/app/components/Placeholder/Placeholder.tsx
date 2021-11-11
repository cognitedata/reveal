import {
  Body,
  Button,
  Detail,
  Graphic,
  Icon,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { useState } from 'react';
import { PlaceholderWrapper } from './elements';

export const Placeholder = ({
  componentName,
  componentDescription,
  votingHandler,
}: {
  componentName: string;
  componentDescription: string;
  votingHandler: (response: string) => void;
}) => {
  const [showVotingResponse, setShowVotingResponse] = useState(false);
  const onVote = (vote: string) => {
    setShowVotingResponse(true);
    votingHandler(vote);
  };

  return (
    <PlaceholderWrapper>
      <div className="content">
        <div className="placeholder-text">
          <Title level={3}>Coming soon</Title>
          <Tooltip
            content={
              <Body level={3} strong style={{ color: 'var(--cogs-white)' }}>
                {componentDescription}
              </Body>
            }
            placement="bottom"
            arrow={false}
            delay={250}
          >
            <Body level={1} strong className="component-name">
              {componentName}
              <Icon type="Help" />
            </Body>
          </Tooltip>
          <Body level={1}>
            is on our roadmap. You can vote to help us prioritize the
            development, or contact the team{' '}
            <a href="mailto:devx@cognite.com">devx@cognite.com</a> if you want
            to share more ideas.
          </Body>
        </div>
        <div className="placeholder-actions">
          <Body level={1}>When should we start working on that?</Body>
          <Button icon="ThumbsUp" onClick={() => onVote('ASAP')}>
            ASAP
          </Button>
          <Button icon="ThumbsUp" onClick={() => onVote('Later')}>
            Later
          </Button>
          <Body level={1}>or</Body>
          <Button icon="ThumbsDown" onClick={() => onVote('No need')}>
            Don't need it
          </Button>
          {showVotingResponse && <Detail>Thanks for voting!</Detail>}
        </div>
      </div>
      <Graphic type="Search" style={{ width: 147, height: 147 }}></Graphic>
    </PlaceholderWrapper>
  );
};
