import { Dropdown, Menu, Button } from '@cognite/cogs.js';
import { useListPeopleWithNoEquipmentQuery } from 'graphql/generated';
import { useRecoilState } from 'recoil';
import { equipmentPersonAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

import { EditOptionItem } from '../../Popup/elements';

export const EditOwnerDropdown: React.FC = () => {
  const { data, isLoading } = useListPeopleWithNoEquipmentQuery();
  const people = data?.people?.items || [];
  const [person, setPerson] = useRecoilState(equipmentPersonAtom);

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
                    setPerson({
                      ...p,
                      name: p?.name || '',
                      externalId: p?.externalId || '',
                    });
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
          <div>{person.name ? person.name : 'Select...'}</div>
        </Button>
      </Dropdown>
    </EditOptionItem>
  );
};
