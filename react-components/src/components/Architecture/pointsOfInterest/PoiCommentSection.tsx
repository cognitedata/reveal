/*!
 * Copyright 2024 Cognite AS
 */

import { Accordion, Flex, Avatar } from '@cognite/cogs.js';
import { type ReactNode, useState, useMemo } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { CreatePoiCommentCommand } from '../../../architecture/concrete/pointsOfInterest/CreatePoiCommentCommand';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { useTranslation } from '../../i18n/I18n';
import { createButton } from '../CommandButtons';
import { useCommentsForPoiQuery } from './useCommentsForPoiQuery';
import { useSelectedPoi } from './useSelectedPoi';
import styled from 'styled-components';

export const PoiCommentSection = (): ReactNode => {
  const { t } = useTranslation();

  const poi = useSelectedPoi();

  const [open, setOpen] = useState<boolean>(true);

  const comments = useCommentsForPoiQuery(poi);
  if (poi === undefined) {
    return null;
  }

  return (
    <Accordion
      type="ghost"
      title={t({ key: 'COMMENTS' })}
      expanded={open}
      onChange={(expanded: boolean) => {
        setOpen(expanded);
      }}>
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

export const SingleCommentDisplay = ({ comment }: { comment: CommentProperties }): ReactNode => {
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
    const command = new CreatePoiCommentCommand(poi);
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
