import { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { ColorStatus } from '@transformations/utils';

import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  IconType,
  A,
} from '@cognite/cogs.js';

export type TabHeaderProps = {
  className?: string;
  description?: React.ReactNode;
  details?: React.ReactNode;
  extra?: React.ReactNode;
  icon: IconType;
  status: ColorStatus;
  title: string;
  titleLink?: string;
};

const TabHeader = ({
  className,
  description = '',
  details,
  extra,
  icon,
  status,
  title,
  titleLink,
}: TabHeaderProps): JSX.Element => {
  const { t } = useTranslation();

  const [showDetails, setShowDetails] = useState(false);

  const styledTitle = titleLink ? (
    <StyledA href={titleLink} target="_blank" strong>
      {title}
    </StyledA>
  ) : (
    <Body level={3} strong>
      {title}
    </Body>
  );

  return (
    <Flex className={className} direction="column" gap={10}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={8}>
          <Icon
            css={{ color: Colors[`text-icon--status-${status}`] }}
            type={icon}
          />
          {styledTitle}
          {description && (
            <>
              <StyledDivider />
              <StyledHeaderDescription level={3}>
                {description}
              </StyledHeaderDescription>
            </>
          )}
        </Flex>
        <Flex gap={8}>
          {details && (
            <Button
              icon={showDetails ? 'ChevronUp' : 'ChevronDown'}
              iconPlacement="right"
              onClick={() => setShowDetails((prevState) => !prevState)}
              size="small"
              type="ghost"
            >
              {t(showDetails ? 'hide-details' : 'show-details')}
            </Button>
          )}
          {extra && <div>{extra}</div>}
        </Flex>
      </Flex>
      {showDetails && details}
    </Flex>
  );
};

const StyledHeaderDescription = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

const StyledDivider = styled.div`
  background-color: ${Colors['border--muted']};
  height: 16px;
  width: 1px;
`;

const StyledA = styled(A)`
  &&& {
    text-decoration: none;
  }
  ,
  a {
    color: ${Colors['text-icon--interactive--default']} !important;

    :hover {
      color: ${Colors['text-icon--interactive--hover']} !important;
    }
  }
`;

export default TabHeader;
