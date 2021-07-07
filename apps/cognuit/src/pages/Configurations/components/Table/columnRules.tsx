import { Rule, UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { Badge, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import { ProgressType } from 'components/Molecules/ProgressBar/types';
import ProgressBar from 'components/Molecules/ProgressBar';
import { ThirdPartySystems } from 'types/globalTypes';

import EditableName from '../EditableName';
import { StatusDot } from '../../../DataTransfers/elements';
import {
  ActionWrapper,
  LinkButton,
  PlayStopButton,
  RestartButton,
  TableActionsContainer,
} from '../../elements';
import DirectionArrows from '../DirectionArrows';

type ActionsType = {
  direction: string;
  statusActive: boolean;
  id: number;
  name: string;
};

interface Props {
  handleStopStart: (id: number, isActive: boolean) => void;
  handleRestart: (id: number) => void;
  handleNameChange: (id: number, newName: string) => boolean;
}

export const columnRules: (actions: Props) => Rule[] = ({
  handleStopStart,
  handleRestart,
  handleNameChange,
}: Props) => {
  return [
    {
      key: 'business_tags',
      render: ({ value }: { value: string[] }) =>
        value.map((tag: string) => (
          <Badge key={tag} text={tag} background="greyscale-grey2" />
        )),
    },
    {
      key: 'datatypes',
      render: ({ value }: { value: string[] }) =>
        value.map((tag: string) => (
          <Badge key={tag} text={tag} background="greyscale-grey2" />
        )),
    },
    {
      key: 'created_time',
      render: ({ value }: { value: number }) =>
        new Date(value * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
    },
    {
      key: 'last_updated',
      render: ({ value }: { value: number }) =>
        new Date(value * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
    },
    {
      key: 'author',
      render: ({ value }: { value: string }) =>
        value.length > 20 ? (
          <Tooltip content={value}>
            <span>{`${value.substring(0, 20)}...`}</span>
          </Tooltip>
        ) : (
          value
        ),
    },
    {
      key: 'target',
      render: ({ value }: { value: any }) => value.external_id,
    },
    {
      key: 'repoProject',
      render: ({ value }: { value: string }) => value,
    },
    {
      key: 'status_active',
      render: ({ value }: { value: boolean }) =>
        value ? 'Active' : 'Inactive',
    },
    {
      key: 'progress',
      width: 100,
      render: ({ value }: { value: any[] }) => {
        if (Object.values(value).length) {
          return Object.entries(value).map(([key, progress]) => {
            const total: number = progress.total || 0;

            const succeeded: ProgressType = {
              label: 'Succeeded',
              value: progress.succeeded || 0,
              color: Colors['midblue-3'].hex(),
            };

            const outdated: ProgressType = {
              label: 'Outdated',
              value: progress.outdated || 0,
              color: Colors.danger.hex(),
            };

            const notUploaded: ProgressType = {
              label: 'Not uploaded',
              value: progress.not_uploaded || 0,
              color: Colors.danger.hex(),
            };

            return (
              <ProgressBar
                key={key}
                name={key}
                total={total}
                progress={[succeeded, outdated, notUploaded]}
                totalProgress={progress.succeeded}
              />
            );
          });
        }

        return <ProgressBar />;
      },
    },
    {
      key: 'statusColor',
      disableSortBy: true,
      render: ({ value }: { value: boolean }) => {
        const color = value
          ? Colors.success.hex()
          : Colors['greyscale-grey3'].hex();
        return (
          <Tooltip content={<span>{value ? 'Active' : 'Inactive'}</span>}>
            <StatusDot bgColor={color} />
          </Tooltip>
        );
      },
    },
    {
      key: 'conf_name',
      render: ({ value }: { value: { name: string; id: number } }) => (
        <EditableName
          name={value.name}
          onSaveChange={(newName) => handleNameChange(value.id, newName)}
        />
      ),
    },
    {
      key: 'actions',
      disableSortBy: true,
      render: ({ value }: { value: ActionsType }) => (
        <TableActionsContainer>
          <ActionWrapper>
            <Tooltip
              content={
                value.direction === 'psToOw'
                  ? `${ThirdPartySystems.PS} to ${ThirdPartySystems.OW}`
                  : `${ThirdPartySystems.OW} to ${ThirdPartySystems.PS}`
              }
            >
              <DirectionArrows psToOw={value.direction === 'psToOw'} />
            </Tooltip>
          </ActionWrapper>
          <ActionWrapper>
            <Tooltip content="Restart Translations">
              <RestartButton
                unstyled
                aria-label="Restart"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart(value.id);
                }}
              >
                <Icon type="Refresh" />
              </RestartButton>
            </Tooltip>
          </ActionWrapper>
          <ActionWrapper>
            <Tooltip content={value.statusActive ? 'Stop' : 'Start'}>
              <PlayStopButton
                unstyled
                aria-label={value.statusActive ? 'Stop' : 'Start'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStopStart(value.id, value.statusActive);
                }}
              >
                {value.statusActive ? (
                  <svg width="6" height="6">
                    <rect
                      width="6"
                      height="6"
                      style={{ fill: 'currentColor' }}
                    />
                  </svg>
                ) : (
                  <Icon type="TriangleRight" />
                )}
              </PlayStopButton>
            </Tooltip>
          </ActionWrapper>
          <ActionWrapper>
            <LinkButton to={`/data-transfers?configuration=${value.name}`}>
              <Icon type="Link" />
            </LinkButton>
          </ActionWrapper>
        </TableActionsContainer>
      ),
    },
  ];
};
