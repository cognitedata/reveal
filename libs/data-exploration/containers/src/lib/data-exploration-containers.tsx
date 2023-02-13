import styles from './data-exploration-containers.module.css';

/* eslint-disable-next-line */
export interface DataExplorationContainersProps {}

export function DataExplorationContainers(
  props: DataExplorationContainersProps
) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to DataExplorationContainers!</h1>
    </div>
  );
}

export default DataExplorationContainers;
