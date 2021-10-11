export const isEnterPressed = (event: React.KeyboardEvent) => {
  return event.key === 'Enter';
};

export const getElementById = (id: string) => document.getElementById(id);
