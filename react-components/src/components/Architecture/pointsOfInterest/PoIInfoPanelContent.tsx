import { PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Button,
  CloseIcon,
  Comment,
  Divider,
  Flex,
  ShareIcon,
  TextLabel,
  WaypointIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { PoISharePanel } from './PoISharePanel';
import { useRenderTarget } from '../../RevealCanvas';
import styled from 'styled-components';
import { ReactNode, useMemo } from 'react';
import { PoIVisibility } from '../../../architecture/concrete/pointsOfInterest/ads/types';
import { PointOfInterest } from '../../../architecture';
import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { queryKeys } from '../../../utilities/queryKeys';
import { createButton } from '../CommandButtons';
import { getDefaultCommand } from '../utilities';
import { CreatePoICommentCommand } from '../../../architecture/concrete/pointsOfInterest/CreatePoICommentCommand';
import { useCommentsForPoi } from './useCommentsForPoi';

export const PoIInfoPanelContent = ({
  poiObject
}: {
  poiObject: PointsOfInterestDomainObject<any>;
}): ReactNode => {
  return (
    <>
      <PoIHeader poiDomainObject={poiObject} />
      <PoIBody poiDomainObject={poiObject} />
    </>
  );
};

const PoIHeader = ({
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
      <StyledBreadcrumbs style={{ overflow: 'hidden' }}>
        <Breadcrumbs.Item
          icon={<WaypointIcon />}
          label={{ fallback: 'Points of Interest' }.fallback}
          onClick={() => poiDomainObject.setSelectedPointsOfInterest(undefined)}
        />
        <Breadcrumbs.Item label={selectedPoi.id} />
      </StyledBreadcrumbs>
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
          onClick={() => poiDomainObject.setSelectedPointsOfInterest(undefined)}
        />
      </Flex>
    </Flex>
  );
};

const PoIBody = ({
  poiDomainObject
}: {
  poiDomainObject: PointsOfInterestDomainObject<any> | undefined;
}): ReactNode => {
  const selectedPoi = poiDomainObject?.selectedPointsOfInterest;
  console.log('Rendering selected', selectedPoi);
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
}) => {
  const comments = useCommentsForPoi(domainObject, poi);

  return (
    <Accordion type="ghost" title={{ key: 'COMMENTS', fallback: 'Comments' }.fallback}>
      {comments.data?.map((comment) => <CommentDisplay comment={comment} />)}
      <CreateCommentField poi={poi} />
    </Accordion>
  );
};

export const CommentDisplay = ({ comment }: { comment: CommentProperties }) => {
  return (
    <Flex direction="row">
      <Avatar text={comment.ownerId} />
      <TextLabel text={comment.content} />
    </Flex>
  );
};

export const CreateCommentField = ({ poi }: { poi: PointOfInterest<unknown> }) => {
  const renderTarget = useRenderTarget();

  const command = useMemo(() => {
    const command = getDefaultCommand(new CreatePoICommentCommand(), renderTarget);
    command.poi = poi;
    console.log('Setting poi = ', poi);
    return command;
  }, [renderTarget, poi]);

  return createButton(command, 'right');
};

const StyledBreadcrumbs = styled(Breadcrumbs)`
  overflow: hidden;
`;
