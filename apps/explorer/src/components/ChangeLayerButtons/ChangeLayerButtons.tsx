import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { MapContext } from 'components/Map/MapProvider';
import { useContext } from 'react';
import { useRecoilState } from 'recoil';
import { floorArray } from 'recoil/map/constants';
import { floorLayerIndexState } from 'recoil/map/layerAtom';
import { changeMapFloor } from 'utils/map/changeMapFloor';

import { Divider, LayerButtonWrapper, LayerText } from './elements';

const MIN_INDEX = 0;
const MAX_INDEX = floorArray.length - 1;
const FLOOR_OFFSET = 4;

export const ChangeLayerButtons = () => {
  const { modelRef } = useContext(MapContext);
  const { client } = useAuthContext();
  const [floorLayerIndex, setFloorLayerIndex] =
    useRecoilState(floorLayerIndexState);

  const handleChangeFloor = (nextLayer: number) => {
    if (client) {
      modelRef.current.removeAllStyledNodeCollections();

      changeMapFloor(client, modelRef.current, floorArray[nextLayer]);
      setFloorLayerIndex(nextLayer);
    }
  };

  const handlePlusClick = () => {
    handleChangeFloor(floorLayerIndex + 1);
  };
  const handleMinusClick = () => {
    handleChangeFloor(floorLayerIndex - 1);
  };

  return (
    <LayerButtonWrapper>
      <Button
        disabled={floorLayerIndex === MAX_INDEX}
        icon="ChevronUp"
        onClick={handlePlusClick}
        type="ghost"
        aria-label="Switch to floor above"
      />
      <Divider />
      <LayerText>{floorLayerIndex + FLOOR_OFFSET}</LayerText>
      <Divider />
      <Button
        disabled={floorLayerIndex === MIN_INDEX}
        icon="ChevronDown"
        onClick={handleMinusClick}
        type="ghost"
        aria-label="Switch to floor below"
      />
    </LayerButtonWrapper>
  );
};
