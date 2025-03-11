import { createContext } from 'react';
import { InputFieldViewModelDependencies } from './InputField.viewmodel.context';
import { useInputFieldViewModel } from './InputField.viewmodel';

export type InputFieldViewDependencies = {
  useInputFieldViewModel: typeof useInputFieldViewModel;
};

export const InputFieldViewContext = createContext<InputFieldViewDependencies>({
  useInputFieldViewModel
});
