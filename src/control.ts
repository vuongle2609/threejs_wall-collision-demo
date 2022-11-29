import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GRAVITY, JUMP_FORCE, SPEED } from "./configs/constants";
import * as toastr from "toastr";
import { Vector3 } from "three";
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
  character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> & {
    touching?: boolean;
    direction?: Vector3 | null;
  };
  control: OrbitControls;
  currentPosition: Vector3;
  camera: THREE.PerspectiveCamera;
  isJump: boolean;
  velocityY: number = 0;
  airDirection: Vector3 | null;
  scene: THREE.Scene;

  constructor(
    character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>,
    control: OrbitControls,
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene
  ) {
    this.scene = scene;
    this.camera = camera;
    this.input = new BasicCharacterControllerInput();
    this.control = control;
    this.character = character;

    this.currentPosition = new Vector3();
  }

  updateNewPosition(deltaT: number) {
    // vector chi huong di chuyen
    const direction = new Vector3().copy(this.currentPosition);

    const frontVector = new Vector3(
      0,
      0,
      (this.input.keys.backward ? 1 : 0) - (this.input.keys.forward ? 1 : 0)
    );

    const sideVector = new Vector3(
      (this.input.keys.left ? 1 : 0) - (this.input.keys.right ? 1 : 0),
      0,
      0
    );

    direction.subVectors(frontVector, sideVector);

    this.currentPosition.copy(this.character.position);

    let gravityVector = new Vector3(0, 0, 0);

    let moveVector = new Vector3(direction.x, 0, direction.z);

    if (this.character.touching) {
      // vector tu tuong chi vuong goc ve huong character
      const wallVector = new Vector3(0, 0, 1).normalize();

      const moveVectorCopy = new Vector3()
        .copy(new Vector3(moveVector.x, 0, moveVector.z))
        .normalize();

      // - khi dang dam vao tuong se chi cho phep
      // lui ra sau hoac cheo ve dang sau
      // - goc giua vector cua tuong va vector di chuyen
      // lon hon 1 co nghia la dang huong ve tuong =))
      if (wallVector.angleTo(moveVectorCopy) > 1) {
        const dotWallPlayer = new Vector3()
          .copy(moveVectorCopy)
          .dot(wallVector);

        const wallVectorScalar = new Vector3(
          wallVector.x * dotWallPlayer,
          wallVector.y * dotWallPlayer,
          wallVector.z * dotWallPlayer
        );

        const newMoveVector = new Vector3().subVectors(
          moveVectorCopy,
          wallVectorScalar
        );

        moveVector = new Vector3(newMoveVector.x, 0, newMoveVector.z);
      }
    }

    moveVector.normalize().multiplyScalar(SPEED);

    if (this.isJump) {
      this.velocityY -= GRAVITY * deltaT;

      if (
        !this.airDirection ||
        this.character.touching ||
        this.input.keys.backward ||
        this.input.keys.forward ||
        this.input.keys.left ||
        this.input.keys.right
      ) {
        this.airDirection = moveVector;
      }

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
        new Vector3(
          moveVector.x ? 0 : this.airDirection.x,
          this.airDirection.y,
          moveVector.z ? 0 : this.airDirection.z
        )
      );
    }

    this.character.position
      .add(new Vector3(moveVector.x, 0, moveVector.z))
      .add(gravityVector);
  }

  update(deltaT: number) {
    if (deltaT > 0.15) {
      deltaT = 0.15;
    }

    this.updateNewPosition(deltaT);
  }
}
