export type ModalConfig = {
  header: {
    suite: string;
    boards: string;
  };
  buttons: {
    save: string;
    suite: Record<string, string>;
    boards: Record<string, string>;
  };
  width: {
    suite: number;
    boards: number;
  };
};

export type ModalSettings = {
  create: ModalConfig;
  edit: ModalConfig;
};

export const modalSettings: ModalSettings = {
  create: {
    header: { suite: 'Create a new suite', boards: 'Add board to suite' },
    buttons: {
      save: 'Create',
      suite: {
        goToBoards: 'Add boards',
      },
      boards: {
        board: 'Add board',
      },
    },
    width: { suite: 536, boards: 904 },
  },
  edit: {
    header: { suite: 'Edit suite', boards: 'Edit boards' },
    buttons: {
      save: 'Save',
      suite: {
        goToBoards: 'Edit boards',
      },
      boards: {
        board: 'Update board',
      },
    },
    width: { suite: 536, boards: 904 },
  },
};
