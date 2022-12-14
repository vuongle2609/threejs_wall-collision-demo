import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import "toastr/build/toastr.min.css";
import Camera_movement from "./camera.js";
import { ASPECT, FAR, FOV, NEAR, SPEED } from "./configs/constants";
import Character_control from "./control";
import Light from "./light";
class Game {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  control: OrbitControls;
  stats: Stats;
  character_control: Character_control;
  camera_movement: Camera_movement;
  lastTime: number;
  clock: THREE.Clock;
  character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial> & {
    touching?: boolean;
    direction?: THREE.Vector3 | null;
  };
  characterBB: THREE.Box3;
  wallsBB: THREE.Box3[] = [];

  constructor() {
    this.initialize();
  }

  initialize() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener(
      "resize",
      () => {
        this.onWindowResize();
      },
      false
    );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#DEF5E5");
    this.scene.add(new THREE.AxesHelper(200));

    this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.dispose();

    new Light(this.scene);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshPhongMaterial({ color: 0xffe9b1 })
    );
    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.position.set(0, -2, 0);
    plane.receiveShadow = true;
    this.scene.add(plane);

    const wallsArray = [
      {
        position: [0, 3, -20],
        size: [40, 10, 2],
        rotation: [0, 0, 0],
      },
      {
        position: [-20, 3, 0],
        size: [30, 10, 2],
        rotation: [0, 0, 0],
      },
      {
        position: [-40, 3, -20],
        size: [2, 20, 40],
        rotation: [0, 0, 0],
      },
      {
        position: [40, 3, -20],
        size: [2, 10, 40],
        rotation: [0, 0, 0],
      },
      {
        position: [30, 3, 20],
        size: [2, 10, 40],
        rotation: [0, 0, 0],
      },
      {
        position: [10, 3, 20],
        size: [2, 40, 10],
        rotation: [0, 0, 0],
      },
    ];

    wallsArray.forEach(({ position, size, rotation }) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        new THREE.MeshPhongMaterial({ color: 0xfffbc1 })
      );

      wall.castShadow = true;
      wall.receiveShadow = true;

      wall.rotation.set(rotation[0], rotation[1], rotation[2]);
      wall.position.set(position[0], position[1], position[2]);

      this.scene.add(wall);

      const wallBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      wallBB.setFromObject(wall);

      this.wallsBB.push(wallBB);
    });

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshPhongMaterial({ color: 0x0d4c92 })
    );

    cube.castShadow = true;
    cube.receiveShadow = true;
    this.character = cube;

    Object.defineProperties(this.character, {
      touching: {
        value: false,
        writable: true,
      },
      direction: {
        value: null,
        writable: true,
      },
    });

    this.characterBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.characterBB.setFromObject(cube);
    this.scene.add(cube);

    this.character_control = new Character_control(
      cube,
      this.control,
      this.camera,
      this.scene
    );
    this.camera_movement = new Camera_movement(cube, this.camera);

    this.stats = Stats();
    // fps show
    document.body.appendChild(this.stats.dom);

    this.clock = new THREE.Clock();
    this.gameloop(0);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  isBetween(
    objectLimit: { max: THREE.Vector3; min: THREE.Vector3 },
    objectCompare: {
      max: THREE.Vector3;
      min: THREE.Vector3;
    },
    fieldCompare: "x" | "y" | "z",
    numberRound?: "floor" | "ceil"
  ) {
    const limitMin = Math[numberRound || "floor"](
      objectLimit.min[fieldCompare]
    );
    const limitMax = Math[numberRound || "floor"](
      objectLimit.max[fieldCompare]
    );

    const compareMin = Math[numberRound || "floor"](
      objectCompare.min[fieldCompare]
    );
    const compareMax = Math[numberRound || "floor"](
      objectCompare.max[fieldCompare]
    );
    if (
      (limitMin < compareMin && limitMax > compareMin) ||
      (limitMin < compareMax && limitMax > compareMax)
    )
      return true;

    if (
      (compareMin < limitMin && compareMax > limitMin) ||
      (compareMin < limitMax && compareMax > limitMax)
    )
      return true;

    return false;
  }

  isMoreThan(
    objectLimit: { max: THREE.Vector3; min: THREE.Vector3 },
    objectCompare: {
      max: THREE.Vector3;
      min: THREE.Vector3;
    },
    fieldCompare: "x" | "y" | "z"
  ) {
    if (
      objectLimit.min[fieldCompare] > objectCompare.min[fieldCompare] &&
      objectLimit.max[fieldCompare] > objectCompare.max[fieldCompare]
    ) {
      return true;
    }

    return false;
  }

  checkCollisions() {
    let touching = false;
    let direction = null;

    this.wallsBB.forEach((item) => {
      if (this.characterBB.intersectsBox(item)) {
        touching = true;

        //get normal vector at intersect face
        if (
          this.isBetween(
            { max: item.max, min: item.min },
            { max: this.characterBB.max, min: this.characterBB.min },
            "x"
          ) &&
          this.isBetween(
            { max: item.max, min: item.min },
            { max: this.characterBB.max, min: this.characterBB.min },
            "x",
            "ceil"
          )
        ) {
          if (
            this.isMoreThan(
              { max: item.max, min: item.min },
              { max: this.characterBB.max, min: this.characterBB.min },
              "z"
            )
          ) {
            direction = new THREE.Vector3(0, 0, -1);
            return;
          } else {
            direction = new THREE.Vector3(0, 0, 1);
            return;
          }
        }

        if (
          this.isBetween(
            { max: item.max, min: item.min },
            { max: this.characterBB.max, min: this.characterBB.min },
            "z"
          )
        ) {
          if (
            this.isMoreThan(
              { max: item.max, min: item.min },
              { max: this.characterBB.max, min: this.characterBB.min },
              "x"
            )
          ) {
            direction = new THREE.Vector3(-1, 0, 0);
            return;
          } else {
            direction = new THREE.Vector3(1, 0, 0);
            return;
          }
        }
      }
    });

    this.character.touching = touching;
    this.character.direction = direction;
  }

  gameloop(t: number) {
    requestAnimationFrame((t) => {
      this.gameloop(t);
    });

    this.checkCollisions();
    this.characterBB
      .setFromObject(this.character)
      .expandByVector(new THREE.Vector3(1, 0, 1).multiplyScalar(SPEED));

    const deltaT = this.clock.getDelta();

    this.renderer.render(this.scene, this.camera);
    this.character_control.update(deltaT);
    this.stats.update();
    this.camera_movement.update();
  }
}

new Game();
