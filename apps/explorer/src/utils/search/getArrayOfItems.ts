import {
  EquipmentLocationQueryTypeGenerated,
  GetSearchDataQueryTypeGenerated,
  Person,
  Room,
} from 'graphql/generated';

import { SearchDataFormat } from './types';

const isRoom = (item: Room | Person): item is Room => {
  return (item as Room).nodeId !== undefined;
};

export const getArrayOfItems = (
  searchResults: GetSearchDataQueryTypeGenerated,
  equipmentData: EquipmentLocationQueryTypeGenerated,
  filterSection?: string
) => {
  const items: SearchDataFormat[] = [];
  if (!searchResults) return items;

  const sections = Object.keys(searchResults).filter((section) =>
    filterSection ? filterSection === section : true
  ) as Array<keyof GetSearchDataQueryTypeGenerated>;

  sections.forEach((section) => {
    const sectionItems = searchResults[section]?.items || [];
    sectionItems.forEach((item: Person | Room | null) => {
      if (item) {
        let filteredItem;
        if (isRoom(item)) {
          const roomEquipment =
            equipmentData.equipment?.items.filter(
              (equipmentItem) =>
                equipmentItem?.room?.externalId === item.externalId
            ) || [];

          const equipment = [
            ...new Set(
              roomEquipment.map((equipmentItem) => equipmentItem?.type)
            ),
          ];

          filteredItem = {
            ...item,
            name: item.name || '(No name)',
            equipment,
            description: item.description || '(No description)',
            type: item.type || '(No type)',
            section,
          };
        } else {
          filteredItem = {
            ...item,
            name: item.name || '(No name)',
            section,
          };
        }

        items.push(filteredItem);
      }
    });
  });

  return items;
};
