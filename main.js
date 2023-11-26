import "./style.css";
import * as THREE from "three";

// canvas
const canvas = document.querySelector("canvas");

// シーン
const scene = new THREE.Scene();
scene.background = new THREE.Color("#5c658b");

// サイズ
const sizes = {
  width: innerWidth,
  height: innerHeight,
};

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

// ライト
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// スノードームの球
const sphereGeometry = new THREE.SphereGeometry(5, 32, 16);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// スノードーム内のオブジェクト
// 雪だるまの頭と体
const snowmanBody = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
const snowmanHead = new THREE.Mesh(
  new THREE.SphereGeometry(1.15, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
snowmanBody.position.set(0, -1, 0);
snowmanHead.position.set(0, 1.3, 0);
scene.add(snowmanBody, snowmanHead);

// 雪だるまの目
const eyeGeometry = new THREE.SphereGeometry(0.15, 32);
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.3, 0.5, 1);
rightEye.position.set(0.3, 0.5, 1);
snowmanHead.add(leftEye, rightEye);

// 雪だるまの鼻
const noseGeometry = new THREE.ConeGeometry(0.3, 1, 16);
const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 0, 1.2);
nose.rotation.x = Math.PI / 2;

// 雪だるまの手
const handGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 8);
const handMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
const leftHand = new THREE.Mesh(handGeometry, handMaterial);
const rightHand = new THREE.Mesh(handGeometry, handMaterial);

leftHand.position.set(-1.5, 0.8, 0);
rightHand.position.set(1.5, 0.8, 0);
leftHand.rotation.z = Math.PI / 4;
rightHand.rotation.z = -Math.PI / 4;

snowmanHead.add(nose);
snowmanBody.add(leftHand, rightHand);

// 線形補間で滑らかに移動させる
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start);
}

// スクロールアニメーション
let prevScrollPercent = 0;
const scrollAnimations = [
  {
    start: 0,
    end: 40,
    function() {
      camera.position.set(0, 1, 10);
      sphere.position.z = lerp(-10, 0, scalePercent(0, 40));
      snowmanBody.position.z = lerp(-10, 0, scalePercent(0, 40));
      snowmanHead.position.z = lerp(-10, 0, scalePercent(0, 40));
    },
  },
  {
    start: 40,
    end: 100,
    function() {
      const angleX = lerp(0, Math.PI * 2, scalePercent(40, 100));
      const angleZ = lerp(0, Math.PI * 2, scalePercent(40, 100));
      const radius = 10;

      camera.position.x = Math.sin(angleX) * radius;
      camera.position.z = Math.cos(angleZ) * radius;
      camera.lookAt(sphere.position);
    },
  },
];

// アニメーションを開始
function startScrollAnimation() {
  scrollAnimations.forEach((scrollAnimation) => {
    if (scrollPercent >= scrollAnimation.start && scrollPercent <= scrollAnimation.end) {
      scrollAnimation.function();
    }
  });
}

// ブラウザのスクロール率
let scrollPercent = 0;

window.addEventListener("scroll", () => {
  scrollPercent = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
});

// 雪片
const snowflakesCount = 200;
const snowflakesGeometry = new THREE.BufferGeometry();
const snowflakesArray = new Float32Array(snowflakesCount * 3);

// 雪片の初期位置をランダムに設定
for (let i = 0; i < snowflakesCount; i++) {
  const i3 = i * 3;
  const phi = Math.acos(-1 + Math.random() * 2);
  const theta = Math.random() * Math.PI * 2;
  const radius = 3.5;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);

  snowflakesArray[i3] = x;
  snowflakesArray[i3 + 1] = y;
  snowflakesArray[i3 + 2] = z;

  const localPosition = sphere.worldToLocal(new THREE.Vector3(x, y, z));
  snowflakesArray[i3] = localPosition.x;
  snowflakesArray[i3 + 1] = localPosition.y;
  snowflakesArray[i3 + 2] = localPosition.z;
}
snowflakesGeometry.setAttribute("position", new THREE.BufferAttribute(snowflakesArray, 3));

const snowflakeMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
});
const snowflakes = new THREE.Points(snowflakesGeometry, snowflakeMaterial);
sphere.add(snowflakes);

// 雪片の速度を管理する配列
const snowflakeSpeeds = [];

// 雪片の速度をランダムに設定
for (let i = 0; i < snowflakesCount; i++) {
  snowflakeSpeeds.push(Math.random() * 0.02 + 0.01);
}

// 雪片のアニメーション
function snowflakesAnimate() {
  const positions = snowflakesGeometry.attributes.position.array;

  for (let i = 0; i < snowflakesCount; i++) {
    const i3 = i * 3;
    positions[i3 + 1] -= snowflakeSpeeds[i];

    if (positions[i3 + 1] < -3.5) {
      positions[i3 + 1] = 3.5;
    }
  }

  snowflakesGeometry.attributes.position.needsUpdate = true;
}

// アニメーション
function animate() {
  startScrollAnimation();
  renderer.render(scene, camera);
  snowflakesAnimate();
  window.requestAnimationFrame(animate);
};

animate();

// ブラウザのリサイズ
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});
