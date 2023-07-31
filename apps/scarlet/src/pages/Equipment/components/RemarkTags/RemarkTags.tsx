import { CollapsePanelProps, Icon, Tag } from '@cognite/cogs.js';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getTagColor } from 'utils';

import * as Styled from './style';

const allTags = [
  'PCMS',
  'U1',
  'PVAR',
  'Nameplate',
  'Miscellaneous',
  'Mech Drawing',
  'U2',
];

const panelKey = 'tags-panel';

type RemarkTagsProps = {
  remarkId: string;
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  disabled: boolean;
};

export const RemarkTags = ({
  remarkId,
  tags,
  setTags,
  disabled,
}: RemarkTagsProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(false);
  }, [remarkId]);

  return (
    <Styled.TagCollapse
      expandIcon={expandIcon}
      activeKey={isOpen ? panelKey : undefined}
      onChange={(value) => {
        setIsOpen(value.includes(panelKey));
      }}
    >
      <Styled.TagPanel
        header={
          <Styled.Header className="cogs-body-3">
            <Styled.HeaderLabel>Label:</Styled.HeaderLabel>
            {!tags.length && (
              <Styled.HeaderAddTag>Add tag...</Styled.HeaderAddTag>
            )}
            {!!tags.length && (
              <Styled.AllTags>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    color={getTagColor(tag)}
                    closable
                    onClose={(e) => {
                      e.stopPropagation();
                      if (disabled) return;
                      setTags((tags) => tags.filter((item) => item !== tag));
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Styled.AllTags>
            )}
          </Styled.Header>
        }
        key={panelKey}
        isActive
      >
        <Styled.AllTags>
          {allTags.map((tag) => {
            const isAdded = tags.includes(tag);
            const tagProps = isAdded
              ? {
                  closable: true,
                  onClose: disabled
                    ? undefined
                    : () =>
                        setTags((tags) => tags.filter((item) => item !== tag)),
                }
              : {
                  onClick: disabled
                    ? undefined
                    : () => setTags((tags) => [...tags, tag]),
                  icon: 'Plus',
                };
            return (
              <Tag key={tag} color={getTagColor(tag)} {...tagProps}>
                {tag}
              </Tag>
            );
          })}
        </Styled.AllTags>
      </Styled.TagPanel>
    </Styled.TagCollapse>
  );
};

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return (
    <Icon
      type="ChevronDownLarge"
      aria-label="Toggle tags"
      style={{
        marginRight: 0,
        width: '10px',
        transition: 'transform .2s',
        transform: `rotate(${!isActive ? 0 : -180}deg)`,
        flexShrink: 0,
      }}
    />
  );
};
