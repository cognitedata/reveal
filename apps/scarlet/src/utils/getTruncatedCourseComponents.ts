import {
  DataElementState,
  EquipmentComponent,
  EquipmentComponentType,
  EquipmentConfig,
  EquipmentType,
} from 'types';
import { getCourseComponents } from 'transformations';

const getComponentElemValue = ({
  key,
  componentType,
  components,
}: {
  key: string;
  componentType: EquipmentComponentType;
  components: EquipmentComponent[];
}) =>
  components
    .find((comp) => comp.type === componentType)
    ?.componentElements.find(
      (elem) => elem.key === key && elem.state === DataElementState.APPROVED
    )?.detections[0]?.value ?? '';

export const getTruncatedCourseComponents = ({
  componentType,
  equipmentType,
  prevComponents,
  newComponents,
  config,
}: {
  componentType: EquipmentComponentType;
  equipmentType: EquipmentType;
  prevComponents: EquipmentComponent[];
  newComponents: EquipmentComponent[];
  config: EquipmentConfig;
}) => {
  let resComponents = newComponents;
  const prevNumbOfCourses =
    parseInt(
      getComponentElemValue({
        key: 'no_of_courses',
        componentType,
        components: prevComponents,
      }),
      10
    ) || 0;

  const newNumbOfCourses =
    parseInt(
      getComponentElemValue({
        key: 'no_of_courses',
        componentType,
        components: newComponents,
      }),

      10
    ) || 0;

  if (newNumbOfCourses === 0 && newComponents.length > 1) {
    resComponents = resComponents.filter(
      (comp) =>
        !(
          comp.type === EquipmentComponentType.COURSE &&
          comp.id.startsWith(componentType)
        )
    );
  } else if (newNumbOfCourses && newNumbOfCourses < prevNumbOfCourses) {
    const allComps = newComponents.filter(
      (comp) =>
        !(
          comp.type === EquipmentComponentType.COURSE &&
          comp.id.startsWith(componentType)
        )
    );
    const courseComps = newComponents.filter(
      (comp) =>
        comp.type === EquipmentComponentType.COURSE &&
        comp.id.startsWith(componentType)
    );
    resComponents = [...allComps, ...courseComps.slice(0, newNumbOfCourses)];
  } else if (newNumbOfCourses > prevNumbOfCourses) {
    const courseComponents = getCourseComponents({
      idPrexis: componentType,
      numbOfCourses: newNumbOfCourses - prevNumbOfCourses,
      equipmentType,
      config,
      startIndex: prevNumbOfCourses,
    });
    resComponents = [...newComponents, ...courseComponents];
  }

  return resComponents;
};
