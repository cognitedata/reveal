import { Select } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import { EquipmentDocument } from 'types';

import * as Styled from './style';

const defaultValue = {
  value: '',
  label: 'No document selected',
  divider: true,
};

type Props = {
  documents?: EquipmentDocument[];
  zoomToDocument: (docExternalId: string) => void;
};

export const DocumentNavigator = ({ documents, zoomToDocument }: Props) => {
  const [selectedOption, setSelectedOption] = useState(defaultValue);

  const options = useMemo(() => {
    if (!documents?.length) return [];
    return [
      defaultValue,
      ...documents.map((doc) => ({
        value: doc.externalId || doc.id.toString(),
        label: doc.externalId || doc.id.toString(),
      })),
    ];
  }, [documents?.length]);

  if (!options.length) return null;

  return (
    <Styled.Container>
      <Select
        title="Go to:"
        width={320}
        value={selectedOption}
        options={options}
        onChange={(o: any) => {
          setSelectedOption(o);
          zoomToDocument(o.value);
        }}
      />
    </Styled.Container>
  );
};
