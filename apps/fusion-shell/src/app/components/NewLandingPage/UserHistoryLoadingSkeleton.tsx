import styled from 'styled-components';

import times from 'lodash/times';

import { Colors, Divider, Flex } from '@cognite/cogs.js';

const USER_ITEM_LOADING_COUNT = 5;

const UserHistoryItemLoadingSkeleton = (): JSX.Element => {
  return (
    <StyledSkl alignItems="center" justifyContent="space-between">
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        gap={16}
      >
        <div className="skl skl-icon" />
        <Flex direction="column" alignItems="flex-start" gap={5}>
          <div className="skl skl-title" />
          <div className="skl skl-desc" />
        </Flex>
      </Flex>
      <div className="skl skl-timestamp" />
    </StyledSkl>
  );
};

const UserHistoryLoadingSkeleton = (): JSX.Element => {
  return (
    <StyledSklContainer
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      {times(USER_ITEM_LOADING_COUNT, (i) => {
        return (
          <>
            <UserHistoryItemLoadingSkeleton />
            {i < USER_ITEM_LOADING_COUNT - 1 && <Divider />}
          </>
        );
      })}
    </StyledSklContainer>
  );
};

const StyledSklContainer = styled(Flex)`
  width: 100%;
  border: 1px solid ${Colors['border--muted']};
  border-radius: 9px;
`;

const StyledSkl = styled(Flex)`
  padding: 16px;
  width: 100%;

  .skl {
    background: ${Colors['surface--strong']};
    border-radius: 6px;
    animation: skeleton-loading 1s linear infinite alternate;
  }

  @keyframes skeleton-loading {
    0% {
      background-color: hsl(0, 0%, 90%);
    }
    100% {
      background-color: hsl(0, 0%, 96%);
    }
  }

  .skl-title,
  .skl-timestamp {
    width: 135px;
    height: 19px;
  }
  .skl-desc {
    width: 88px;
    height: 12px;
  }
  .skl-icon {
    width: 36px;
    height: 36px;
  }
`;

export default UserHistoryLoadingSkeleton;
