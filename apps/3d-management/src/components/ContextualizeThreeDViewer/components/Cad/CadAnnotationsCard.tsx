import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';

import { useCadContextualizeStore } from './useCadContextualizeStore';

export const CadAnnotationsCard = () => {
  const { contextualizedNodes } = useCadContextualizeStore((state) => ({
    contextualizedNodes: state.contextualizedNodes,
  }));

  return (
    <div
      style={{
        position: 'absolute',
        top: FLOATING_ELEMENT_MARGIN,
        right: FLOATING_ELEMENT_MARGIN,
        background: 'white',
        padding: '4px',
        borderRadius: '4px',
      }}
    >
      Asset Mappings: {contextualizedNodes?.length ?? 0}
    </div>
  );
};
