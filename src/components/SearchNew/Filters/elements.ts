export const reactSelectCogsStylingProps = {
  components: {
    IndicatorSeparator: () => null,
  },
  styles: {
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: 'var(--cogs-greyscale-grey6)',
      transform: state.isFocused ? 'rotate(180deg)' : 'rotate(0)',
    }),
    control: (base: any) => ({
      ...base,
      height: '34px',
      backgroundColor: '#f1f1f1',
      '&:focus-within': {
        backgroundColor: 'white',
        border: '2px solid var(--cogs-border--status-neutral--strong)',
      },
      '&:hover': {
        border: '2px solid transparent',
      },
      border: '2px solid transparent',
    }),
  },
};
