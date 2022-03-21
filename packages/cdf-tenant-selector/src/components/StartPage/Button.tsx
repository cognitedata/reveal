import React from 'react';
import { Icon, AllIconTypes } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Flex, Text, Box } from '../common';

interface ButtonProps {
  icon: AllIconTypes;
  title: string;
  tagline?: string;
  learnMoreLink?: string;
  chip?: string;
}

const Button = ({ icon, title, tagline, learnMoreLink, chip }: ButtonProps) => {
  return (
    <Wrapper>
      <Flex direction="row" items="center">
        <Box pr={12} pl={3}>
          <Icon type={icon} />
        </Box>
        <div>
          <div>
            <Text weight={500} size={15}>
              {title}
            </Text>
            {chip && <Chip>{chip}</Chip>}
          </div>
          <div>
            {tagline && (
              <>
                <Text color="#595959">{tagline}</Text>
                {learnMoreLink && (
                  <Box inline ml={3}>
                    <a
                      href={learnMoreLink}
                      target="_new"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn more
                    </a>
                  </Box>
                )}
              </>
            )}
            <span />
          </div>
        </div>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border: 2px solid #d9d9d9;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  :hover {
    border-color: #6e85fc;
  }
`;

const Chip = styled.span`
  background-color: #edf0ff;
  color: #4255bb;
  padding: 1px 3px;
  font-size: 12px;
  font-weight: 600;
  margin: 3px;
  border-radius: 2px;
`;

export default Button;
