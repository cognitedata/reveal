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
  Divider,
  Flex,
  ShareIcon,
  TextLabel,
  WaypointIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { PoISharePanel } from './PoISharePanel';
import styled from 'styled-components';
import { type ReactElement, type ReactNode } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { createButtonFromCommandConstructor } from '../CommandButtons';
import { CreatePoICommentCommand } from '../../../architecture/concrete/pointsOfInterest/CreatePoICommentCommand';
import { useCommentsForPoI } from './useCommentsForPoI';

export const PoIInfoPanelContent = ({
  poiObject
}: {
  poiObject: PointsOfInterestDomainObject<any>;
}): ReactNode => {
  return (
    <>
      <PanelHeader poiDomainObject={poiObject} />
      <PanelBody poiDomainObject={poiObject} />
    </>
  );
};

const PanelHeader = ({
  poiDomainObject
}: {
  poiDomainObject: PointsOfInterestDomainObject<any> | undefined;
}): ReactNode => {
  const selectedPoi = poiDomainObject?.selectedPointsOfInterest;
  if (poiDomainObject === undefined || selectedPoi === undefined) {
    return undefined;
  }

  return (
    <Flex direction="row" justifyContent="space-between" alignItems="center">
      <Flex direction="row" alignContent="start" gap={8}>
        <WaypointIcon /> <TextLabel text={selectedPoi.id} />
      </Flex>
      <Divider direction="vertical" weight="2px" />
      <Flex direction="row" justifyContent="flex-start">
        <Dropdown
          appendTo={document}
          placement="bottom-end"
          content={<PoISharePanel poiDomainObject={poiDomainObject} />}>
          <Button icon=<ShareIcon /> type="ghost" />
        </Dropdown>
        <Divider direction="vertical" weight="2px" />
        <Button
          icon=<CloseIcon />
          onClick={() => {
            poiDomainObject.setSelectedPointOfInterest(undefined);
          }}
        />
      </Flex>
    </Flex>
  );
};

const PanelBody = ({
  poiDomainObject
}: {
  poiDomainObject: PointsOfInterestDomainObject<any> | undefined;
}): ReactNode => {
  const selectedPoi = poiDomainObject?.selectedPointsOfInterest;
  if (poiDomainObject === undefined || selectedPoi === undefined) {
    return undefined;
  }

  return (
    <>
      <h2>{selectedPoi.properties.title}</h2>
      <CommentSection domainObject={poiDomainObject} poi={selectedPoi} />
    </>
  );
};

export const CommentSection = ({
  domainObject,
  poi
}: {
  domainObject: PointsOfInterestDomainObject<unknown>;
  poi: PointOfInterest<unknown>;
}): ReactElement => {
  const comments = useCommentsForPoI(domainObject, poi);

  return (
    <Accordion type="ghost" title={{ key: 'COMMENTS', fallback: 'Comments' }.fallback} gap={8}>
      <Flex direction="column" gap={8}>
        {comments.data?.map((comment) => (
          <SingleCommentDisplay key={`${comment.ownerId}/${comment.content}`} comment={comment} />
        ))}
      </Flex>
      <CommentFieldContainer>
        <CreateCommentField poi={poi} />
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

export const CreateCommentField = ({ poi }: { poi: PointOfInterest<unknown> }): ReactNode => {
  return createButtonFromCommandConstructor(() => new CreatePoICommentCommand(poi), {});
};

const CommentFieldContainer = styled.div`
  margin-top: 8px;
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  overflow: hidden;
`;
