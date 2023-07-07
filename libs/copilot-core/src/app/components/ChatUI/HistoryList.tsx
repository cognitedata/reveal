import { useMemo } from 'react';

import styled from 'styled-components';

import { Body, Button, Flex, Icon } from '@cognite/cogs.js';

import { Chat, useChats, useDeleteChat } from '../../hooks/useChatHistory';
import { useCopilotContext } from '../../utils/CopilotContext';

export const HistoryList = () => {
  const { data: chats } = useChats();

  const { setCurrentChatId, setMode, currentChatId } = useCopilotContext();

  const { mutate: deleteChat } = useDeleteChat();

  const groupedChats = useMemo(() => groupChatsByTime(chats || []), [chats]);

  return (
    <Wrapper>
      {Object.entries(groupedChats).map(([dateRange, value]) => (
        <>
          <Body style={{ padding: 16 }} strong level={2}>
            {dateRange}
          </Body>
          {value.map((chat) => (
            <ChatItemWrapper
              $isSelected={currentChatId === chat.id}
              gap={16}
              alignItems="center"
              direction="row"
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                setMode('chat');
              }}
            >
              <div className="cogs-avatar">
                <Icon type="Comment" />
              </div>
              <Body level={2} style={{ flex: 1 }}>
                {chat.name || chat.dateUpdated.toLocaleString()}
              </Body>
              <Button
                type="ghost-destructive"
                icon="Delete"
                className="delete-btn"
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              />
            </ChatItemWrapper>
          ))}
        </>
      ))}
    </Wrapper>
  );
};

// thx gpt
const groupChatsByTime = (items: Chat[] = []): { [key: string]: Chat[] } => {
  const groupedItems: { [key: string]: Chat[] } = {};

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group items into sections
  items.forEach((item) => {
    const itemDate = new Date(item.dateUpdated);
    itemDate.setHours(0, 0, 0, 0);

    // Today
    if (itemDate.getTime() === today.getTime()) {
      if (!groupedItems['Today']) {
        groupedItems['Today'] = [];
      }
      groupedItems['Today'].push(item);
    }
    // Yesterday
    else if (itemDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      if (!groupedItems['Yesterday']) {
        groupedItems['Yesterday'] = [];
      }
      groupedItems['Yesterday'].push(item);
    }
    // Last week
    else if (itemDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      if (!groupedItems['Last week']) {
        groupedItems['Last week'] = [];
      }
      groupedItems['Last week'].push(item);
    }
    // Last month
    else if (itemDate.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000) {
      if (!groupedItems['Last month']) {
        groupedItems['Last month'] = [];
      }
      groupedItems['Last month'].push(item);
    }
    // By month
    else {
      const monthYear = `${itemDate.getMonth() + 1}/${itemDate.getFullYear()}`;
      if (!groupedItems[monthYear]) {
        groupedItems[monthYear] = [];
      }
      groupedItems[monthYear].push(item);
    }
  });

  return groupedItems;
};

const ChatItemWrapper = styled(Flex)<{ $isSelected?: boolean }>`
  background: ${(props) =>
    props.$isSelected
      ? 'rgba(153, 137, 250, 0.18)'
      : 'rgba(153, 137, 250, 0.08)'};
  transition: 0.3s all;
  padding: 16px;
  .cogs-avatar {
    background: radial-gradient(
      190.15% 190.15% at -12.5% 12.5%,
      rgba(139, 92, 246, 0.08) 0%,
      rgba(94, 40, 217, 0.08) 100%
    );
    color: rgba(94, 40, 217, 1);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .delete-btn {
    opacity: 0;
    transition: 0.3s all;
  }

  &&:hover {
    background: rgba(153, 137, 250, 0.18);
    .delete-btn {
      opacity: 1;
    }
  }
`;

const Wrapper = styled.div`
  flex: 1;
  overflow: auto;
`;
