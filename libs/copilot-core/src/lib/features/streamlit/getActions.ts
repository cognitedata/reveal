import { GetActionsFunc } from '../../types';

export const StreamlitActions = [
  {
    type: 'GENERATE_APP',
    name: 'Generate App',
    description: 'I want to generate a new Streamlit app',
  },
];

export const getActionsForStreamlit: GetActionsFunc = async (
  pastMessages,
  sendMessage
) => {
  if (pastMessages.filter((el) => el.source === 'user').length === 0) {
    return StreamlitActions.map((el) => ({
      onClick: async () => {
        sendMessage({ content: el.description, type: 'text' });
      },
      content: el.name,
    }));
  }
  return [];
};
