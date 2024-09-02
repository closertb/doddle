import React from 'react';
import { UseFormReturn } from './useForm';

const HFormContext = React.createContext<UseFormReturn | null>(null);

export const useFormContext = () => React.useContext(HFormContext) as UseFormReturn;

export const HFormProvider: React.FC<UseFormReturn> = (props) => {
  const { children, actions = {}, context = {}, ...rest } = props;
  const _actions: UseFormReturn['actions'] = {};

  Object.entries(actions).forEach(([key, value]) => {
    _actions[key] = value;
  });

  return (
    <HFormContext.Provider
      value={{
        ...rest,
        context,
        actions: _actions,
      }}
    >
      {children}
    </HFormContext.Provider>
  );
};
