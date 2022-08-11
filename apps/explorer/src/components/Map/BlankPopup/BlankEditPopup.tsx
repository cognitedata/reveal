import { EditPopupContent } from '../Popup/EditPopupContent';
import { EditPopupContentFieldsWrapper } from '../Popup/elements';
import { NameInput } from '../Popup/NameInput';

import { BlankPopupSubmitButton } from './BlankPopupSubmitButton';
import { MainTypeSelect } from './Fields/MainTypeSelect';
import { SubTypeSelect } from './Fields/SubTypeSelect';

export const BlankEditPopup: React.FC = () => {
  return (
    <EditPopupContent title="" SubmitButton={BlankPopupSubmitButton}>
      <EditPopupContentFieldsWrapper>
        <MainTypeSelect />
        <NameInput />
        <SubTypeSelect />
      </EditPopupContentFieldsWrapper>
    </EditPopupContent>
  );
};
