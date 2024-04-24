import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"

import { gsap } from "gsap"

// import JSConfetti from "js-confetti"
import confetti from "canvas-confetti"

/**
 ******************************
 ****** Three.js Initial ******
 ******************************
 */

/**
 * Init
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xe9e9e9)
const scene1 = new THREE.Scene()

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
)
camera.position.set(1.6, 1.6, 0.8)
camera.lookAt(0.5, 0.2, 0)
scene.add(camera)

// const size = 1.7
// const cameraWidth = (size * window.innerWidth) / window.innerHeight / 2
// const cameraHeight = size / 2

// const camera = new THREE.OrthographicCamera(
//   -cameraWidth / 2,
//   cameraWidth / 2,
//   cameraHeight,
//   -cameraHeight,
//   1,
//   1000
// )
// camera.position.set(0, 1.5, 1.5)
// camera.lookAt(0, 0, -0.5)
// scene.add(camera)

const camera1 = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / 2 / window.innerHeight,
  0.1,
  1000
)
camera1.position.set(1.6, 1.6, 0.8)
camera1.lookAt(0.5, 0.2, 0)
scene1.add(camera1)

// const camera1 = new THREE.OrthographicCamera(
//   -cameraWidth / 2,
//   cameraWidth / 2,
//   cameraHeight,
//   -cameraHeight,
//   1,
//   1000
// )
// camera1.position.set(0, 1.5, 1.5)
// camera1.lookAt(0, 0, -0.5)
// scene1.add(camera1)

/**
 * Addition
 */
// Controls
// const orbitControls = new OrbitControls(camera, canvas)
// orbitControls.enableDamping = true
// const orbitControls1 = new OrbitControls(camera1, canvas)
// orbitControls1.enableDamping = true

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)
const ambientLight1 = new THREE.AmbientLight(0xffffff, 1)
scene1.add(ambientLight1)

// Environment Map
new RGBELoader().setPath("environment/").load("royal_esplanade_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping

  // scene.background = texture;
  scene.environment = texture
  scene1.environment = texture
})

// Clock
const clock = new THREE.Clock()

// Raycaster
const raycaster = new THREE.Raycaster()

// Axes
// const axes = new THREE.AxesHelper(10)
// scene.add(axes)

// Loading
const manager = new THREE.LoadingManager()

// GLTF Loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/draco/")
const gltfLoader = new GLTFLoader(manager)
gltfLoader.setDRACOLoader(dracoLoader)

// Audio
const audioLoader = new THREE.AudioLoader()
const audioListener = new THREE.AudioListener()
const audio = new THREE.Audio(audioListener)

audioLoader.load("audios/doThis.mp3", (buffer) => {
  audio.setBuffer(buffer)
  audio.setLoop(false)
  audio.setVolume(0.5)
})

/**
 ******************************
 ************ Main ************
 ******************************
 */

/**
 * Definitions
 */
// Confetti
// const jsConfetti = new JSConfetti()

// game parameters
let level = 1
let step = 1

let mouse = new THREE.Vector2()
let startPosition = new THREE.Vector2()
let promptStartPosition = new THREE.Vector3()
let promptEndPosition = new THREE.Vector3()

// Main Model
let toilet = []
let cursor
let animations = [{}, {}]
let mixer = []
let curAnim = []
let waterFlow = []

let promptLimit = 0
let isUserInteracted = false
let isInteractAvailable = false
let isCorrectStart = false

// Loading Progress Bar
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  document.querySelector(".progressbar").style.width =
    (itemsLoaded / itemsTotal) * 100 + "%"
  if (itemsLoaded === itemsTotal) {
    document.querySelector("#instructions").innerHTML = `
                <span class="buttonload" stu>
                    <i class="fa fa-spinner fa-spin"></i>Click to Start!
                </span>
            `
    window.addEventListener("mousedown", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              setTimeout(() => {
                prompt()
              }, 5000)
              try {
                audio.play()
                playAnim(0, "play")
              } catch {}
            }, 2000)
          },
        })
      } catch {}
    })

    window.addEventListener("touchstart", (e) => {
      try {
        document.querySelector(".progress").style.opacity = 1
        document.querySelector("#blocker").style.opacity = 1

        gsap.to(document.querySelector(".progress").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
        })
        gsap.to(document.querySelector("#blocker").style, {
          opacity: 0,
          duration: 2,
          delay: 1,
          onComplete: () => {
            document.querySelector(".progress").remove()
            document.querySelector("#blocker").remove()
            setTimeout(() => {
              setTimeout(() => {
                prompt()
              }, 5000)
              try {
                audio.play()
                playAnim(0, "play")
              } catch {}
            }, 2000)
          },
        })
      } catch {}
    })
  }
}

/**
 * Models
 */
gltfLoader.load(`/models/tap1.glb`, (gltf) => {
  toilet[0] = gltf.scene
  toilet[0].rotation.y = Math.PI

  toilet[0].traverse((child) => {
    if (child.name.startsWith("Wall")) {
      // child.visible = false
      child.children[0].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // floor
      // child.children[1].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // wall
    }

    if (child.name === "Water_Flow") {
      waterFlow[0] = child.material
      waterFlow[0].map.wrapS = THREE.RepeatWrapping
      waterFlow[0].map.wrapT = THREE.RepeatWrapping
    }

    if (child.name.startsWith("Hidden")) {
      child.visible = false
    }
  })

  for (let i = 0; i < gltf.animations.length; i++) {
    console.log(gltf.animations[i].name)
  }

  mixer[0] = new THREE.AnimationMixer(toilet[0])

  animations[0].idle = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Idle")
  )
  animations[0].play = mixer[0].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Variation_1")
  )

  animations[0].play.setLoop(THREE.LoopOnce)
  animations[0].play.clampWhenFinished = true

  curAnim = animations[0].idle
  curAnim.play()

  // toilet[0].position.x = -1

  scene.add(toilet[0])
})

gltfLoader.load(`/models/tap1.glb`, (gltf) => {
  toilet[1] = gltf.scene
  toilet[1].rotation.y = Math.PI

  toilet[1].traverse((child) => {
    if (child.name.startsWith("Wall")) {
      // child.visible = false
      child.children[0].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // floor
      // child.children[1].material = new THREE.MeshStandardMaterial({ color: 0xbababa }) // wall
    }

    if (child.name === "Water_Flow") {
      waterFlow[1] = child.material
      waterFlow[1].map.wrapS = THREE.RepeatWrapping
      waterFlow[1].map.wrapT = THREE.RepeatWrapping
    }

    if (child.name.startsWith("Hidden")) {
      if (child.name.endsWith("start")) promptStartPosition = child.position
      if (child.name.endsWith("end")) promptEndPosition = child.position
      child.visible = false
      // child.material.transparent = true
      // child.material.opacity = 0.5
    }
  })

  for (let i = 0; i < gltf.animations.length; i++) {
    console.log(gltf.animations[i].name)
  }

  mixer[1] = new THREE.AnimationMixer(toilet[1])

  animations[1].idle = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Idle")
  )
  animations[1].play = mixer[1].clipAction(
    THREE.AnimationClip.findByName(gltf.animations, "Variation_1")
  )

  animations[1].play.setLoop(THREE.LoopOnce)
  animations[1].play.clampWhenFinished = true

  curAnim = animations[1].idle
  curAnim.play()

  // toilet[1].position.x = 1

  scene1.add(toilet[1])
})

// Prompt
gltfLoader.load("/models/cursor.glb", (gltf) => {
  cursor = gltf.scene
  cursor.lookAt(camera1.position)
  cursor.scale.set(0.3, 0.3, 0.3)
  cursor.children[0].material.depthTest = false
  cursor.children[0].material.depthWrite = false
  cursor.children[0].renderOrder = 1
  cursor.children[0].material.opacity = 0
  scene1.add(cursor)
})

/**
 * Functioins
 */
// Prompt
function prompt() {
  audio.play()
  cursor.position.copy(promptStartPosition)
  isInteractAvailable = true
  gsap.to(cursor.children[0].material, {
    opacity: 1,
    duration: 1,
    onComplete: () => {
      gsap.fromTo(
        cursor.position,
        {
          x: promptStartPosition.x,
          y: promptStartPosition.y,
          z: promptStartPosition.z,
        },
        {
          x: promptEndPosition.x,
          y: promptEndPosition.y,
          z: promptEndPosition.z,
          duration: 1.5,
          onComplete: () => {
            hidePrompt()
            setTimeout(() => {
              if (!isUserInteracted) {
                promptLimit++
                if (promptLimit == 3) {
                  playAnim(1, "play")
                  setTimeout(() => {
                    refresh()
                  }, 5000)
                } else {
                  prompt()
                }
              }
            }, 5500)
          },
        }
      )
    },
  })
}

function hidePrompt() {
  cursor.scale.set(0.3, 0.3, 0.3)
  gsap.to(cursor.children[0].material, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      gsap.killTweensOf(cursor.children[0].material)
      gsap.killTweensOf(cursor.position)
    },
  })
}

// Animation Play
function playAnim(id, name, period = 0.5) {
  const newAction = animations[id][name]
  const oldAction = curAnim[id]

  newAction.reset()
  newAction.play()

  try {
    if (newAction != oldAction) newAction.crossFadeFrom(oldAction, period)
  } catch {}

  curAnim[id] = newAction
}

function refresh() {
  location.reload()
}

function tada() {
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 0.2, y: 0.65 },
  })
  confetti({
    particleCount: 250,
    spread: 120,
    origin: { x: 0.7, y: 0.65 },
  })
}

/**
 * Event Listeners
 */
window.addEventListener("mousedown", (event) => {
  mouse.x = ((2 * event.clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  console.log(camera.position)
  console.log(camera.rotation)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name == "Hidden_start") isCorrectStart = true
  }
})

window.addEventListener("mouseup", (event) => {
  mouse.x = ((2 * event.clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name === "Hidden_end" && isInteractAvailable && isCorrectStart) {
      isUserInteracted = true
      isInteractAvailable = false
      hidePrompt()
      tada()
      playAnim(1, "play")
      setTimeout(() => {
        refresh()
      }, 5000)
    }
  }
  isCorrectStart = false
})

window.addEventListener("touchstart", (event) => {
  mouse.x = ((2 * event.changedTouches[0].clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name == "Hidden_start") isCorrectStart = true
  }
})

window.addEventListener("touchend", (event) => {
  mouse.x = ((2 * event.changedTouches[0].clientX - window.innerWidth) / window.innerWidth) * 2 - 1
  mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    let pointedObject = intersects[0].object
    if (pointedObject.name === "Hidden_end" && isInteractAvailable && isCorrectStart) {
      isUserInteracted = true
      isInteractAvailable = false
      hidePrompt()
      tada()
      playAnim(1, "play")
      setTimeout(() => {
        refresh()
      }, 5000)
    }
  }
  isCorrectStart = false
})

// Auto Resize
window.addEventListener("resize", () => {
  // const newAspect = window.innerWidth / 2 / window.innerHeight

  // camera.left = (size * newAspect) / -2
  // camera.right = (size * newAspect) / 2

  // camera.updateProjectionMatrix()

  // camera1.left = (size * newAspect) / -2
  // camera1.right = (size * newAspect) / 2

  // camera1.updateProjectionMatrix()

  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight / 2
  camera.updateProjectionMatrix()

  camera1.aspect = window.innerWidth / window.innerHeight / 2
  camera1.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const animate = () => {
  // Delta Time
  const deltaTime = clock.getDelta()

  if (mixer[0]) mixer[0].update(deltaTime)
  if (waterFlow[0]) {
    waterFlow[0].map.offset.y -= 0.02
  }

  if (mixer[1]) mixer[1].update(deltaTime)
  if (waterFlow[1]) {
    waterFlow[1].map.offset.y -= 0.02
  }

  // Update controls
  // orbitControls.update()
  // orbitControls1.update()

  // Render Scene
  renderer.autoClear = false

  // Render first scene
  renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight)
  renderer.render(scene, camera)

  // Render second scene
  renderer.setViewport(
    window.innerWidth / 2,
    0,
    window.innerWidth / 2,
    window.innerHeight
  )
  renderer.render(scene1, camera1)

  // Call animate again on the next frame
  window.requestAnimationFrame(animate)
}

animate()
