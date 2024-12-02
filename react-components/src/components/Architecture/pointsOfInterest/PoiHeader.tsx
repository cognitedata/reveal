/*!
 * Copyright 2024 Cognite AS
 */
import {
  Flex,
  WaypointIcon,
  Heading,
  Divider,
  Dropdown,
  Tooltip,
  Button,
  ShareIcon,
  CloseIcon,
  Avatar,
  TextLabel
} from '@cognite/cogs.js';
import { type ReactNode } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { RevealButtons } from '../RevealButtons';
import { PoiSharePanel } from './PoiSharePanel';
import { usePoiDomainObject } from './usePoiDomainObject';
import { useSelectedPoi } from './useSelectedPoi';
import { type PointOfInterest } from '../../../architecture';

export const PoiHeader = (): ReactNode => {
  const { t } = useTranslation();

  const poiDomainObject = usePoiDomainObject();

  const selectedPoi = useSelectedPoi();
  if (selectedPoi === undefined) {
    return undefined;
  }

  return (
    <Flex direction="column" gap={8}>
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="row" alignContent="start" gap={8}>
          <WaypointIcon /> <Heading level={5}>{t({ key: 'POINT_OF_INTEREST_PLURAL' })}</Heading>
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
      <CreatePoiOwnerField selectedPoi={selectedPoi} />
      <Divider direction="horizontal" weight="2px" />
    </Flex>
  );
};

export const CreatePoiOwnerField = ({
  selectedPoi
}: {
  selectedPoi: PointOfInterest<any>;
}): ReactNode => {
  const { createdTime, ownerId } = selectedPoi.properties;
  const createTime =
    createdTime !== undefined
      ? new Date(createdTime).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        })
      : 'Date not available';

  return (
    <Flex direction="row" alignItems="center" gap={8}>
      <Avatar size="x-small" text={ownerId} />
      <Divider direction="vertical" weight="2px" />
      <Flex alignItems="center">
        <TextLabel text={createTime} />
      </Flex>
    </Flex>
  );
};
