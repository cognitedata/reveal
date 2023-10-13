import { useContext } from 'react';

import { CopilotContext } from '../context/CopilotContext';

export const useCopilotContext = () => useContext(CopilotContext);
