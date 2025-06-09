import { Flex, Avatar, TextLabel } from '@cognite/cogs.js';
import { type ReactNode, useMemo } from 'react';
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

  const comments = useCommentsForPoiQuery(poi);
  if (poi === undefined) {
    return null;
  }

  return (
    <Flex direction="column" justifyContent="space-between" gap={8}>
      <TextLabel text={t({ key: 'COMMENTS' })} />
      <Flex direction="column" gap={8}>
        {comments.data?.map((comment) => (
          <SingleCommentDisplay key={`${comment.ownerId}/${comment.content}`} comment={comment} />
        ))}
      </Flex>
      <StyledCreateCommentField poi={poi} refetchComments={comments.refetch} />
    </Flex>
  );
};

export const SingleCommentDisplay = ({ comment }: { comment: CommentProperties }): ReactNode => {
  return (
    <Flex direction="row" gap={8} alignContent="center" alignItems="center">
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

const StyledCreateCommentField = styled(CreateCommentField)`
  margin-top: 8px;
`;
