import { useContext, useEffect } from 'react';

import {
  AddReveal3DModelOptions,
  useMappedEdgesForRevisions,
} from '@cognite/reveal-react-components';

import { Mapped3DEquipmentContext } from '../../../../app/providers/Mapped3DEquipmentProvider';

interface Props {
  modelsOptions: AddReveal3DModelOptions[];
}

export const MappedEquipmentContextHandler = ({ modelsOptions }: Props) => {
  const { data: mappedEquipment } = useMappedEdgesForRevisions(
    modelsOptions,
    true
  );

  const context = useContext(Mapped3DEquipmentContext);

  useEffect(() => {
    if (!mappedEquipment || !context?.setMappedEquipment) return;

    context.setMappedEquipment(mappedEquipment);
  }, [mappedEquipment, context?.setMappedEquipment]);

  return <></>;
};
