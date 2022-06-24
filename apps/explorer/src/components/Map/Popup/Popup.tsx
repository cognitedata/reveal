import { IconType } from '@cognite/cogs.js';
import { useState } from 'react';

import { EditPopupContent, PopupContent } from './PopupContent';
import { Container, Content } from './elements';

export interface Props {
  mainText: string;
  subText: string;
  labels: string[];
  disableRoute?: boolean;
  iconType?: IconType;
}

export const Popup: React.FC<Props> = ({ mainText, subText, ...rest }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mainTextValue, setMainTextValue] = useState(mainText);
  const [subTextValue, setSubTextValue] = useState(subText);

  const handleEdit = () => setIsEditMode(!isEditMode);
  return (
    <Container>
      <Content className="z-2">
        {isEditMode ? (
          <EditPopupContent
            handleSubTextChange={(e) => setSubTextValue(e.target.value)}
            handleMainTextChange={(e) => setMainTextValue(e.target.value)}
            handleEdit={handleEdit}
            mainText={mainTextValue}
            subText={subTextValue}
            {...rest}
          />
        ) : (
          <PopupContent
            mainText={mainTextValue}
            subText={subTextValue}
            handleEdit={handleEdit}
            {...rest}
          />
        )}
      </Content>
    </Container>
  );
};
