import { Body, OptionType, Select } from '@cognite/cogs.js';
import { useListPeopleWithNoDeskQuery } from 'graphql/generated';
import { useRecoilState } from 'recoil';
import { equipmentPersonAtom } from 'recoil/equipmentPopup/equipmentPopupAtoms';

export const EditOwnerDropdown: React.FC = () => {
  const { data } = useListPeopleWithNoDeskQuery();
  const people = data?.people?.items || [];
  const [person, setPerson] = useRecoilState(equipmentPersonAtom);

  const peopleOptions = people.map((person) => ({
    label: person?.name || 'No Name',
    value: person,
  }));

  const currentValue = { label: person.name || 'N/A', value: person };

  return (
    <>
      <Body strong level={2}>
        Owner
      </Body>
      <Select
        value={currentValue}
        options={peopleOptions}
        onChange={(
          selectedValue: OptionType<{ externalId: string; name: string }>
        ) => {
          const newPerson = {
            externalId: selectedValue.value?.externalId || '',
            name: selectedValue.value?.name || '',
          };
          setPerson(newPerson);
        }}
      />
    </>
  );
};
