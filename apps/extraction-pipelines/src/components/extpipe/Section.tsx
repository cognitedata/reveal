import styled from 'styled-components';
import React, { PropsWithChildren } from 'react';
import { AllIconTypes, Icon, Button } from '@cognite/cogs.js';

const SectionDiv = styled.div`
  background-color: white;
  margin-bottom: 1rem;
  border-radius: 3px;
`;
const SectionHeader = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  padding: 1rem 0 1rem 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
`;
const SectionBody = styled.div`
  padding: 1rem 0;
  overflow-x: scroll;
`;
export const SectionWithoutHeader = (props: PropsWithChildren<{}>) => (
  <SectionDiv className="z-2">{props.children}</SectionDiv>
);
type Props = {
  title: string;
  icon: AllIconTypes;
  editButton?: { onClick: () => void; canEdit: boolean };
};
export const Section = ({
  icon,
  title,
  editButton,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <SectionDiv className="z-2">
      <SectionHeader>
        <Icon type={icon} style={{ marginRight: '0.5rem' }} /> {title}
        {editButton && (
          <Button
            type="link"
            css="margin-left: auto"
            disabled={!editButton.canEdit}
            onClick={editButton.onClick}
          >
            Edit
          </Button>
        )}
      </SectionHeader>
      <SectionBody>{children}</SectionBody>
    </SectionDiv>
  );
};
