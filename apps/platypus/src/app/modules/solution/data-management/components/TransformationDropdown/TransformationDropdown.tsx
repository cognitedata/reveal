import { Dropdown, Menu, Icon, Button } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Fragment } from 'react';
import styled from 'styled-components';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';
import useTransformationCreateMutation from '../../hooks/useTransformationCreateMutation';
import useTransformations from '../../hooks/useTransformations';
import {
  groupTransformationsByTypes,
  suggestTransformationProperties,
} from '@platypus-core/domain/transformation';

type Props = {
  dataModelExternalId: string;
  typeName: string;
  version: string;
};

export function TransformationDropdown({
  dataModelExternalId,
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
  const createTransformationMutation = useTransformationCreateMutation();

  const arrangedTransformations = groupTransformationsByTypes(
    transformations ?? []
  );

  const handleAddClick = () => {
    const { externalId: transformationExternalId, name: transformationName } =
      suggestTransformationProperties({
        dataModelExternalId,
        numExistingTransformations: transformations
          ? transformations.length
          : 1,
        typeName,
        version,
      });

    createTransformationMutation.mutate(
      {
        dataModelExternalId,
        transformationExternalId,
        transformationName,
        typeName,
        version,
      },
      {
        onSuccess: (transformation) => {
          setIsTransformationModalOpen(true, transformation.id);
        },
      }
    );
  };

  return (
    <Dropdown
      hideOnSelect
      content={
        <Menu>
          {Object.keys(arrangedTransformations).map((key) => (
            <Fragment key={key}>
              {arrangedTransformations[key].transformations.length ? (
                <>
                  <Menu.Header>
                    {`${t('data_for', 'Data For')} ${
                      arrangedTransformations[key].displayName
                    }`}
                  </Menu.Header>
                  {arrangedTransformations[key].transformations.map(
                    (transformation) => (
                      <StyledMenuItem
                        key={transformation.id}
                        onClick={() => {
                          setIsTransformationModalOpen(true, transformation.id);
                        }}
                      >
                        {transformation.name}
                        <Icon type="ExternalLink" />
                      </StyledMenuItem>
                    )
                  )}
                  <Menu.Divider />
                </>
              ) : null}
            </Fragment>
          ))}

          <AddNewButton
            iconPlacement="left"
            icon="Add"
            onClick={handleAddClick}
          >
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

const StyledMenuItem = styled(Menu.Item)`
  && {
    width: 246px;
    justify-content: space-between;
  }
`;

const AddNewButton = styled(Button)`
  && {
    margin-top: 4px;
  }
`;
