import React from 'react';
import { DiagramTag } from '@cognite/pid-tools';
import { Button, Collapse, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Pre } from './elements';

interface TagPanelHeaderProps {
  tag: DiagramTag;
  deleteTag: (tagId: string) => void;
}

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 1rem;
  align-items: center;
  width: 100%;
`;

const NextButton = styled(Button)`
  width: 100%;
`;

const TagPanelHeader = ({ tag, deleteTag }: TagPanelHeaderProps) => {
  return (
    <CollapseHeader>
      <span>{tag.id}</span>
      <Icon onClick={() => deleteTag(tag.id)} type="Close" size={12} />
    </CollapseHeader>
  );
};

interface TagPanelProps {
  tags: DiagramTag[];
  setTags: (arg: DiagramTag[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
}

export const TagPanel: React.FC<TagPanelProps> = ({
  tags,
  setTags,
  activeTagId,
  setActiveTagId,
}) => {
  const deleteTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  return (
    <>
      <Collapse
        accordion
        ghost
        activeKey={activeTagId || undefined}
        onChange={(key) => setActiveTagId(key)}
      >
        {tags.map((tag) => (
          <Collapse.Panel
            header={<TagPanelHeader tag={tag} deleteTag={deleteTag} />}
            key={tag.id}
          >
            <Pre>{JSON.stringify(tag, null, 2)}</Pre>
          </Collapse.Panel>
        ))}
      </Collapse>
      {activeTagId && (
        <NextButton onClick={() => setActiveTagId(null)}>Next tag</NextButton>
      )}
    </>
  );
};
