import { Fragment } from 'react';

import styled from 'styled-components';

import { groupTransformationsByTypes } from '@platypus/platypus-core';

import { createLink } from '@cognite/cdf-utilities';
import { Dropdown, Menu, Button } from '@cognite/cogs.js';

import { useMixpanel } from '../../../../../hooks/useMixpanel';
import { useTranslation } from '../../../../../hooks/useTranslation';
import useTransformations from '../../hooks/useTransformations';

type Props = {
  space: string;
  onAddClick: () => void;
  typeName: string;
  viewVersion: string;
};

export function TransformationDropdown({
  space,
  onAddClick,
  typeName,
  viewVersion,
}: Props) {
  const { t } = useTranslation('BulkPopulation');
  const { track } = useMixpanel();

  const { data: transformations } = useTransformations({
    space,
    isEnabled: true,
    typeName,
    viewVersion,
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
                          track('DataModel.Transformations.Open', {
                            target: groupedTransformations[key].displayName,
                            version: viewVersion,
                          });
                          window.open(
                            createLink(`/transformations/${transformation.id}`),
                            '_blank'
                          );
                        }}
                        icon="Link"
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
