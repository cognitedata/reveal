/*!
 * Copyright 2024 Cognite AS
 */
import {
  Accordion,
  Avatar,
  Button,
  CloseIcon,
  Divider,
  Flex,
  ShareIcon,
  TextLabel,
  Tooltip,
  WaypointIcon
} from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { PoiSharePanel } from './PoiSharePanel';
import styled from 'styled-components';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { type CommentProperties } from '../../../architecture/concrete/pointsOfInterest/models';
import { createButton } from '../CommandButtons';
import { CreatePoiCommentCommand } from '../../../architecture/concrete/pointsOfInterest/CreatePoiCommentCommand';
import { useCommentsForPoiQuery } from './useCommentsForPoiQuery';
import { RevealButtons } from '../RevealButtons';
import { useSelectedPoi } from './useSelectedPoi';
import { useTranslation } from '../../i18n/I18n';
import { usePoiDomainObject } from './usePoiDomainObject';

export const PoiInfoPanelContent = (): ReactNode => {
  return (
    <>
      <PanelHeader />
      <PanelBody />
    </>
  );
};

const PanelHeader = (): ReactNode => {
  const { t } = useTranslation();

  const poiDomainObject = usePoiDomainObject();

  const selectedPoi = useSelectedPoi();

  useEffect(() => {

    async function fetchPoi(): Promise<void> {
      const poiData = await poiDomainObject?.getPoiById(selectedPoi?.id);
      console.log('TEST poiData', selectedPoi, poiData);
    }
    void fetchPoi();
  }, [selectedPoi]);

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
        <Dropdown placement="bottom-end" content={<PoiSharePanel />}>
          <Tooltip placement="top-end" appendTo={document.body} content={t({ key: 'SHARE' })}>
            <Button icon={<ShareIcon />} type="ghost" />
          </Tooltip>
        </Dropdown>
        <RevealButtons.DeleteSelectedPointOfInterest toolbarPlacement={'top'} />
        <Button
          icon={<CloseIcon />}
          type="ghost"
          onClick={() => poiDomainObject?.setSelectedPointOfInterest(undefined)}
        />
      </Flex>
    </Flex>
  );
};

const PanelBody = (): ReactNode => {
  return <CommentSection />;
};

export const CommentSection = (): ReactNode => {
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
      gap={8}
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
