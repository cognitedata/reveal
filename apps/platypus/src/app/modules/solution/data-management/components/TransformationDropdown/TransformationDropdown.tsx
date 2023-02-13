import { Dropdown, Menu, Icon, Button } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Fragment } from 'react';
import styled from 'styled-components';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import useTransformations from '../../hooks/useTransformations';
import { groupTransformationsByTypes } from '@platypus/platypus-core';

type Props = {
  dataModelExternalId: string;
  onAddClick: () => void;
  typeName: string;
  version: string;
};

export function TransformationDropdown({
  dataModelExternalId,
  onAddClick,
  typeName,
  version,
}: Props) {
  const { t } = useTranslation('BulkPopulation');
  const { setIsTransformationModalOpen } = useDataManagementPageUI();

  const { data: transformations } = useTransformations({
    dataModelExternalId,
    isEnabled: true,
    typeName,
    version,
  });

  const groupedTransformations = groupTransformationsByTypes(
    transformations ?? []
  );

  return (
    <Dropdown
      hideOnSelect
      content={
        <Menu>
          {Object.keys(groupedTransformations).map((key) => (
            <Fragment key={key}>
              {groupedTransformations[key].transformations.length ? (
                <>
                  <Menu.Header>
                    {`${t('data_for', 'Data For')} ${
                      groupedTransformations[key].displayName
                    }`}
                  </Menu.Header>
                  {groupedTransformations[key].transformations.map(
                    (transformation) => (
                      <Menu.Item
                        css={{}}
                        key={transformation.id}
                        onClick={() => {
                          setIsTransformationModalOpen(true, transformation.id);
                        }}
                        icon="ExternalLink"
                        iconPlacement="right"
                        style={{ width: 240 }}
                      >
                        {transformation.name}
                      </Menu.Item>
                    )
                  )}
                  <Menu.Divider />
                </>
              ) : null}
            </Fragment>
          ))}

          <AddNewButton iconPlacement="left" icon="Add" onClick={onAddClick}>
            {t('bulk-create-new', 'Create new')}
          </AddNewButton>
        </Menu>
      }
    >
      <Button
        icon={transformations?.length ? 'ChevronDown' : 'ExternalLink'}
        iconPlacement="right"
      >
        {t('bulk-button', 'Bulk population')}
      </Button>
    </Dropdown>
  );
}

const AddNewButton = styled(Button)`
  && {
    margin-top: 4px;
  }
`;
