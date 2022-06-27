import { Button, Label, Title } from '@cognite/cogs.js';
import { useFindLabelByExternalId } from 'hooks/useLabels';
import { SchemaResponse } from 'hooks/useLabelSchemas';
import styled from 'styled-components/macro';

import { Divider } from '../Divider';
import { Tag } from '../Tag';

export const SchemaItem: React.FC<SchemaResponse> = ({
  name,
  date,
  labelExternalId,
  keys,
  onRun,
}) => {
  const labelName = useFindLabelByExternalId(labelExternalId);

  return (
    <SchemaContainer className="z-4">
      <Content>
        <Header>{name}</Header>

        <TagContainer>
          <Label icon="Tag" size="small" variant="unknown">
            {labelName}
          </Label>
          <Label icon="String" size="small" variant="unknown">
            {date.toDateString()}
          </Label>
        </TagContainer>

        <Divider count={keys?.length} />

        {(keys || []).map((key) => (
          <Tag key={key}>{key}</Tag>
        ))}
      </Content>

      <Actions>
        <Button type="ghost">Edit</Button>
        {/* <Button type="secondary" onClick={() => onRun(labelExternalId)}>
          View
        </Button> */}
        <Button type="primary" onClick={() => onRun(labelExternalId)}>
          Run
        </Button>
      </Actions>
    </SchemaContainer>
  );
};

export const Header = styled(Title).attrs({ level: 3 })`
  margin-bottom: 8px;
`;

export const TagContainer = styled.div`
  display: flex;
  gap: 8px;

  .cogs-label--icon {
    margin-right: 4px;
  }
`;

export const SchemaContainer = styled.div`
  width: 300px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: var(--our-bg-invert-color);
`;

const Content = styled.div`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const Actions = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  height: 60px;
  padding: 12px;
  border-top: 1px solid #33333330;
  gap: 8px;
`;
