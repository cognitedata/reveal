import { Dropdown, Menu, Button } from '@cognite/cogs.js';
import { useListPeopleWithNoEquipmentQuery } from 'graphql/generated';
import { useContext } from 'react';

import { EditOptionItem } from '../../Popup/elements';
import { EquipmentContext } from '../EquipmentPopupProvider';

export const EditOwnerDropdown: React.FC = () => {
  const { data, isLoading } = useListPeopleWithNoEquipmentQuery();
  const people = data?.people?.items || [];
  const { formState, updateFields } = useContext(EquipmentContext);
  const { selected } = formState;

  return (
    <EditOptionItem>
      Owner
      <Dropdown
        content={
          <Menu>
            {isLoading
              ? 'Loading'
              : people.map((p) => {
                  const handleClick = () =>
                    updateFields({ selected: { ...p } });
                  return (
                    <Menu.Item key={p?.externalId} onClick={handleClick}>
                      {p?.name}
                    </Menu.Item>
                  );
                })}
          </Menu>
        }
      >
        <Button icon="ChevronDown" iconPlacement="right">
          <div>{selected.name}</div>
        </Button>
      </Dropdown>
    </EditOptionItem>
  );
};
