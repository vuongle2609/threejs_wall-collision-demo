import { GUI } from "dat.gui";
import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { ASPECT, FAR, FOV, NEAR } from "./configs/constants";
import Camera_movement from "./camera.js";
import Character_control from "./control";
import Light from "./light";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

  constructor() {
    this.initialize();
  }

  initialize() {
    // const gui = new GUI();

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
    // this.scene.add(new THREE.AxesHelper(200));

    this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.dispose();

    new Light(this.scene);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(800, 800),
      new THREE.MeshPhongMaterial({ color: 0xfebe8c })
    );
    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.position.set(0, -2, 0);
    plane.receiveShadow = true;

    this.scene.add(plane);

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(50, 10, 1),
      new THREE.MeshPhongMaterial({ color: 0xfffbc1 })
    );

    wall.castShadow = true;
    wall.receiveShadow = true;

    wall.position.set(0, 3, -20);
    this.scene.add(wall);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshPhongMaterial({ color: 0x0d4c92 })
    );

    cube.castShadow = true;
    cube.receiveShadow = true;

    this.scene.add(cube);

    this.character_control = new Character_control(
      cube,
      this.control,
      this.camera
    );
    this.camera_movement = new Camera_movement(cube, this.camera);

    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    this.clock = new THREE.Clock();
    this.gameloop(0);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  gameloop(t: number) {
    requestAnimationFrame((t) => {
      this.gameloop(t);
    });

    const deltaT = this.clock.getDelta();

    this.renderer.render(this.scene, this.camera);
    this.character_control.update(deltaT);
    this.stats.update();
    this.camera_movement.update();
  }
}

new Game();