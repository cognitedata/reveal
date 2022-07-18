const setSelectablilityOfAllText = ({
  document,
  selectable,
}: {
  document: Document;
  selectable: boolean;
}): void => {
  Array.from(document.getElementsByTagName('tspan')).forEach((tspan) => {
    tspan.style.setProperty('user-select', selectable ? 'auto' : 'none');
  });
};

export default setSelectablilityOfAllText;
