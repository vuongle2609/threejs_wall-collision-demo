import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import "toastr/build/toastr.min.css";
import Camera_movement from "./camera.js";
import { ASPECT, FAR, FOV, NEAR } from "./configs/constants";
import Character_control from "./control";
import Light from "./light";
import { isPositionEquals } from "./utils";
import * as toastr from "toastr";
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
  pointer = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  character: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial> & {
    touching?: boolean;
    direction?: THREE.Vector3 | null;
  };
  newUpdatePosition: THREE.Vector3 | null;
  characterBB: THREE.Box3;
  wallBB: THREE.Box3;
  wall: THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>;

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
    // this.control.dispose();

    new Light(this.scene);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshPhongMaterial({ color: 0xffe9b1 })
    );
    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.position.set(0, -2, 0);
    plane.receiveShadow = true;
    plane.name = "sannha";

    this.scene.add(plane);

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(40, 10, 4),
      new THREE.MeshPhongMaterial({ color: 0xfffbc1 })
    );

    const positionAttribute = wall.geometry.getAttribute("position");
    console.log(positionAttribute.array);
    positionAttribute.needsUpdate = true;

    wall.castShadow = true;
    wall.receiveShadow = true;

    wall.position.set(0, 3, -20);
    this.wall = wall;

    this.scene.add(wall);

    this.wallBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    this.wallBB.setFromObject(wall);
    const helper = new THREE.Box3Helper(this.wallBB, new THREE.Color("red"));
    this.scene.add(helper);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.MeshPhongMaterial({ color: 0x0d4c92 })
    );

    cube.castShadow = true;
    cube.receiveShadow = true;
    this.character = cube;
    // const dir = new THREE.Vector3(0, 0, 1);

    // //normalize the direction vector (convert to vector of length 1)
    // dir.normalize();

    // const origin = new THREE.Vector3(0, 0, 0);
    // const length = 10;
    // const hex = 0xffff00;

    // const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    // this.scene.add(arrowHelper);

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
    const helper1 = new THREE.Box3Helper(
      this.characterBB,
      new THREE.Color("blue")
    );
    this.scene.add(helper1);

    window.addEventListener(
      "pointermove",
      (e) => {
        this.onPointerMove(e);
      },
      false
    );

    window.addEventListener(
      "click",
      (e) => {
        // this.onPointerClick(e);
      },
      false
    );

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
    // document.body.appendChild(this.stats.dom);

    this.clock = new THREE.Clock();
    this.gameloop(0);
  }

  onPointerMove(event: PointerEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  onPointerClick(event: MouseEvent) {
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    const sannha = intersects.find((item) => item.object.name == "sannha");

    if (sannha) {
      const clickedCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2, 0.3),
        new THREE.MeshPhongMaterial({ color: 0xa0e4cb })
      );
      clickedCube.castShadow = true;
      clickedCube.receiveShadow = true;
      clickedCube.position.set(sannha?.point.x, -1, sannha?.point.z);

      const toastOptions: any = {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: false,
        positionClass: "toast-bottom-right",
        preventDuplicates: false,
        onclick: null,
        showDuration: "100",
        hideDuration: "100",
        timeOut: "1000",
        extendedTimeOut: "100",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      };

      toastr.success("Raycast", "", toastOptions);

      this.scene.add(clickedCube);
    }

    const newPosition = sannha
      ? new THREE.Vector3(sannha.point.x, sannha.point.y, sannha.point.z)
      : null;

    this.newUpdatePosition = newPosition;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  checkCollisions() {
    if (this.characterBB.intersectsBox(this.wallBB)) {
      this.character.touching = true;
      const vectorDirection = new THREE.Vector3()
        .subVectors(this.wall.position, this.character.position)
        .normalize();
      this.character.direction = vectorDirection;

      return;
    }
    this.character.touching = false;
    this.character.direction = null;
  }

  gameloop(t: number) {
    requestAnimationFrame((t) => {
      this.gameloop(t);
    });

    this.checkCollisions();

    // if (this.newUpdatePosition) {
    //   this.character.position.lerp(
    //     new THREE.Vector3(
    //       this.newUpdatePosition.x,
    //       0,
    //       this.newUpdatePosition.z
    //     ),
    //     0.1
    //   );
    // }

    if (
      isPositionEquals(this.character.position, this.newUpdatePosition, {
        x: true,
        y: false,
        z: true,
      })
    ) {
      this.newUpdatePosition = null;
    }

    const deltaT = this.clock.getDelta();

    this.renderer.render(this.scene, this.camera);
    this.character_control.update(deltaT);
    this.stats.update();
    this.camera_movement.update();

    this.characterBB.setFromObject(this.character);
  }
}

new Game();
