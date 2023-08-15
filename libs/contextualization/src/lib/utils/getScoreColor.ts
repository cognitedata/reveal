export const getScoreColor = (value: number) => {
  if (100 >= value && value >= 80) {
    return 'success';
  } else if (value >= 40) {
    return 'warning';
  } else if (value >= 0) {
    return 'danger';
  } else {
    return 'default';
  }
};
