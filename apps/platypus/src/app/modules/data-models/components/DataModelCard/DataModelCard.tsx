import { Detail, Title, Avatar, Label, Tooltip, Body } from '@cognite/cogs.js';

import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModel } from '@platypus/platypus-core';
import { StyledDataModelCard } from './elements';
import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';

type DataModelCardProps = {
  dataModel: DataModel;
  onOpen: (dataModel: DataModel) => void;
  onEdit: (dataModel: DataModel) => void;
  onDelete: (dataModel: DataModel) => void;
};

export const DataModelCard = ({ dataModel, onOpen }: DataModelCardProps) => {
  const { t } = useTranslation('data-models');
  const dateUtils = useInjection(TOKENS.dateUtils);

  const renderOwners = () => {
    if (dataModel.owners.length) {
      return dataModel.owners?.map((owner) => {
        return (
          <Tooltip content={owner} placement="bottom" key={owner}>
            <Avatar text={owner} className="avatar" css={{}} />
          </Tooltip>
        );
      });
    }
    return (
      <Body level={2} strong className="owners">
        No owners
      </Body>
    );
  };

  return (
    <StyledDataModelCard
      onClick={() => onOpen(dataModel)}
      key={dataModel.id}
      className="z-4"
      data-testid={`data-model-card`}
      data-cy={`data-model-card`}
    >
      <div className="top">
        <div>
          <Title level={5} className="title" data-cy="data-model-card-title">
            {dataModel.name}
            {dataModel.version && (
              <span
                className="version"
                role="definition"
                title={t('data_model_latest_version', 'Latest version number')}
              >
                <Label size="small" variant="unknown">
                  {dataModel.version}
                </Label>
              </span>
            )}
          </Title>
          <Detail>
            {t('data_model_last_updated', 'Last updated')}{' '}
            {dateUtils.format(dataModel.createdTime)}
          </Detail>
        </div>
      </div>
      <div>{renderOwners()}</div>
    </StyledDataModelCard>
  );
};
