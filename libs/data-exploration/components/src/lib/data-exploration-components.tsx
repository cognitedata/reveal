import styles from './data-exploration-components.module.css';

/* eslint-disable-next-line */
export interface DataExplorationComponentsProps {}

export function DataExplorationComponents(
  props: DataExplorationComponentsProps
) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to DataExplorationComponents!</h1>
    </div>
  );
}

export default DataExplorationComponents;
