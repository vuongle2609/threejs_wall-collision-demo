import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GRAVITY, JUMP_FORCE, SPEED } from "./configs/constants";

class BasicCharacterControllerInput {
  keys: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
    shift: boolean;
  };
  constructor() {
    this.initialize();
  }

  initialize() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };

    document.addEventListener("keydown", (e) => this.onKeydown(e), false);
    document.addEventListener("keyup", (e) => this.onKeyup(e), false);
  }

  onKeydown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 87: // w
        this.keys.forward = true;
        break;
      case 65: // a
        this.keys.left = true;
        break;
      case 83: // s
        this.keys.backward = true;
        break;
      case 68: // d
        this.keys.right = true;
        break;
      case 32: // space
        this.keys.space = true;
        break;
      case 16: // shift
        this.keys.shift = true;
        break;
    }
  }

  onKeyup(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 87: // w
        this.keys.forward = false;
        break;
      case 65: // a
        this.keys.left = false;
        break;
      case 83: // s
        this.keys.backward = false;
        break;
      case 68: // d
        this.keys.right = false;
        break;
      case 32: // space
        this.keys.space = false;
        break;
      case 16: // shift
        this.keys.shift = false;
        break;
    }
  }
}

export default class Character_control {
  input: BasicCharacterControllerInput;
  character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  control: OrbitControls;
  currentPosition: THREE.Vector3;
  camera: THREE.PerspectiveCamera;
  isJump: boolean;
  velocityY: number = 0;
  airDirection: THREE.Vector3 | null;

  constructor(
    character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>,
    control: OrbitControls,
    camera: THREE.PerspectiveCamera
  ) {
    this.camera = camera;
    this.input = new BasicCharacterControllerInput();
    this.control = control;
    this.character = character;

    this.currentPosition = new THREE.Vector3();
  }

  updateNewPosition(deltaT: number) {
    const direction = new THREE.Vector3().copy(this.currentPosition);

    const frontVector = new THREE.Vector3(
      0,
      0,
      (this.input.keys.backward ? 1 : 0) - (this.input.keys.forward ? 1 : 0)
    );

    const sideVector = new THREE.Vector3(
      (this.input.keys.left ? 1 : 0) - (this.input.keys.right ? 1 : 0),
      0,
      0
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED);

    this.currentPosition.copy(this.character.position);

    let gravityVector = new THREE.Vector3(0, 0, 0);

    if (this.isJump) {
      this.velocityY -= GRAVITY * deltaT;
      if (!this.airDirection) this.airDirection = direction;

      if (this.character.position.y <= 0) {
        this.airDirection = null;
        this.velocityY = 0;
        gravityVector.y = 0;
        this.isJump = false;
      }
    }

    if (this.input.keys.space && !this.isJump) {
      this.velocityY = JUMP_FORCE;
      this.isJump = true;
    }

    if (this.character.position.y >= 0 && !this.isJump) {
      this.isJump = true;
    }

    gravityVector.y += this.velocityY * deltaT;
    // giu huong nhay khi dang nhay khi tha phim di chuyen
    if (this.airDirection) {
      gravityVector.add(
        new THREE.Vector3(
          direction.x ? 0 : this.airDirection.x,
          this.airDirection.y,
          direction.z ? 0 : this.airDirection.z
        )
      );
    }

    // this.character.rotation.setFromVector3(direction.normalize());

    this.character.position
      .add(new THREE.Vector3(direction.x, 0, direction.z))
      .add(gravityVector);
  }

  update(deltaT: number) {
    if (deltaT > 0.15) {
      deltaT = 0.15;
    }

    this.updateNewPosition(deltaT);
  }
}
