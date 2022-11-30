import * as THREE from "three";
import { Vector3 } from "three";
import {
  CAMERA_FAR_FROM_CHARACTER,
  CAMERA_HEIGHT_FROM_CHARACTER,
  CAMERA_LERP_ALPHA,
  CAMERA_ROTATION,
} from "./configs/constants";

export default class Camera_movement {
  camera: THREE.PerspectiveCamera;
  character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;

  constructor(
    character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>,
    camera: THREE.PerspectiveCamera
  ) {
    this.character = character;
    this.camera = camera;

    this.camera.rotation.set(CAMERA_ROTATION, 0, 0);

    // this.camera.position.set(
    //     this.character.position.x,
    //     this.character.position.y + CAMERA_HEIGHT_FROM_CHARACTER,
    //     this.character.position.z + CAMERA_FAR_FROM_CHARACTER
    // );
  }

  updateNewPosition() {
    this.camera.position.lerp(
      new Vector3(
        this.character.position.x,
        this.character.position.y + CAMERA_HEIGHT_FROM_CHARACTER,
        this.character.position.z + CAMERA_FAR_FROM_CHARACTER
      ),
      CAMERA_LERP_ALPHA
    );
  }

  update() {
    this.updateNewPosition();
  }
}
