import * as THREE from "three";

export const isPositionEquals = (
  object1: any,
  object2: any,
  inclusive?: {
    x: boolean;
    y: boolean;
    z: boolean;
  },
  log?: boolean
) => {
  const { x, y, z } = inclusive || { x: true, y: true, z: true };
  let equals = false;

  if (log) {
    console.log("object 1", object1);
    console.log("object 2", object2);
  }

  if (
    (x ? Math.round(object1?.x) === Math.round(object2?.x) : true) &&
    (y ? Math.round(object1?.y) === Math.round(object2?.y) : true) &&
    (z ? Math.round(object1?.z) === Math.round(object2?.z) : true)
  ) {
    equals = true;
  }

  return equals;
};
