import { OptionType, Select } from '@cognite/cogs.js';
import { useRecoilState } from 'recoil';
import {
  roomEquipmentFilterAtom,
  roomTypeFilterAtom,
} from 'recoil/search/searchFiltersAtom';

import { SubSearchFilterWrapper } from '../SubSearchFilterWrapper';

const PlaceHolderSelectElementEquipment = <div>Equipment</div>;
const PlaceHolderElementType = <div>Type</div>;

const equipmentOptions = [
  { label: 'TV', value: 'tv' },
  { label: 'Whiteboard', value: 'whiteboard' },
  { label: 'Desk', value: 'desk' },
];

const typeOptions = [
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Meeting Room', value: 'meeting-room' },
  { label: 'Printer Room', value: 'printer-room' },
  { label: 'Rest room', value: 'rest-room' },
];

export const RoomSearchSubFilters = () => {
  const [equipmentFilter, setEquipmentFilter] = useRecoilState(
    roomEquipmentFilterAtom
  );
  const [typeFilter, setTypeFilter] = useRecoilState(roomTypeFilterAtom);

  const handleChange =
    (onChange: (param: any) => void) =>
    (newValue: OptionType<string>, { action }: { action: string }) => {
      if (action === 'clear') onChange(undefined);
      onChange(newValue);
    };

  return (
    <SubSearchFilterWrapper filterName="rooms">
      <Select
        value={equipmentFilter}
        contentEditable={false}
        placeholderElement={PlaceHolderSelectElementEquipment}
        placeholderSelectElement={PlaceHolderSelectElementEquipment}
        isMulti
        isClearable={false}
        isSearchable={false}
        showCheckbox
        options={equipmentOptions}
        onChange={handleChange(setEquipmentFilter)}
        width={200}
      />
      <Select
        value={typeFilter}
        contentEditable={false}
        placeholderElement={PlaceHolderElementType}
        isClearable
        isSearchable={false}
        options={typeOptions}
        onChange={handleChange(setTypeFilter)}
        width={200}
      />
    </SubSearchFilterWrapper>
  );
};
