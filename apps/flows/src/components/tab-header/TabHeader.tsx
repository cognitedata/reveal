import styled from 'styled-components';

import { Body, Colors, Flex, Icon, IconType, A } from '@cognite/cogs.js';

export type TabHeaderProps = {
  className?: string;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  icon: IconType;
  status: ColorStatus;
  title: string;
  titleLink?: string;
};

export type ColorStatus =
  | 'critical'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'undefined';

const TabHeader = ({
  className,
  description = '',
  extra,
  icon,
  status,
  title,
  titleLink,
}: TabHeaderProps): JSX.Element => {
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
        <Flex gap={8}>{extra && <div>{extra}</div>}</Flex>
      </Flex>
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
