/*!
 * Copyright 2024 Cognite AS
 */
import { type PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Button,
  CloseIcon,
  DeleteIcon,
  Divider,
  Flex,
  ShareIcon,
  TextLabel,
  WaypointIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { PoISharePanel } from './PoISharePanel';
import styled from 'styled-components';
import { useMemo, type ReactElement, type ReactNode } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { createButton, createButtonFromCommandConstructor } from '../CommandButtons';
import { CreatePoICommentCommand } from '../../../architecture/concrete/pointsOfInterest/CreatePoICommentCommand';
import { useCommentsForPoI } from './useCommentsForPoI';
import { RevealButtons } from '../RevealButtons';
import { useSelectedPoI } from './useSelectedPoI';
import { usePoIDomainObject } from './usePoIDomainObject';

export const PoIInfoPanelContent = (): ReactNode => {
  return (
    <>
      <PanelHeader />
      <PanelBody />
    </>
  );
};

const PanelHeader = (): ReactNode => {
  const selectedPoi = useSelectedPoI();
  if (selectedPoi === undefined) {
    return undefined;
  }

  return (
    <Flex direction="row" justifyContent="space-between" alignItems="center">
      <Flex direction="row" alignContent="start" gap={8}>
        <WaypointIcon /> <TextLabel text={selectedPoi.properties.title ?? selectedPoi.id} />
      </Flex>
      <Divider direction="vertical" weight="2px" />
      <Flex direction="row" justifyContent="flex-start">
        <Dropdown appendTo={document} placement="bottom-end" content={<PoISharePanel />}>
          <Button icon=<ShareIcon /> type="ghost" />
        </Dropdown>
        <RevealButtons.DeleteSelectedPointOfInterest />
      </Flex>
    </Flex>
  );
};

const PanelBody = (): ReactNode => {
  return <CommentSection />;
};

export const CommentSection = (): ReactNode => {
  const poi = useSelectedPoI();

  const comments = useCommentsForPoI(poi);
  if (poi === undefined) {
    return null;
  }

  return (
    <Accordion type="ghost" title={{ key: 'COMMENTS', fallback: 'Comments' }.fallback} gap={8}>
      <Flex direction="column" gap={8}>
        {comments.data?.map((comment) => (
          <SingleCommentDisplay key={`${comment.ownerId}/${comment.content}`} comment={comment} />
        ))}
      </Flex>
      <CommentFieldContainer>
        <CreateCommentField poi={poi} refetchComments={comments.refetch} />
      </CommentFieldContainer>
    </Accordion>
  );
};

export const SingleCommentDisplay = ({ comment }: { comment: CommentProperties }): ReactElement => {
  return (
    <Flex direction="row" gap={8} alignContent="center">
      <Avatar text={comment.ownerId} />
      {comment.content}
    </Flex>
  );
};

export const CreateCommentField = ({
  poi,
  refetchComments
}: {
  poi: PointOfInterest<unknown>;
  refetchComments: () => void;
}): ReactNode => {
  const command = useMemo(() => {
    const command = new CreatePoICommentCommand(poi);
    command.onFinish = () => {
      refetchComments();
    };
    return command;
  }, [poi]);
  return createButton(command, 'right');
};

const CommentFieldContainer = styled.div`
  margin-top: 8px;
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  overflow: hidden;
`;
