<template>
  <svg id="scoresvg" class="absolute top-4 left-1/2 -translate-x-1/2" :width="svgWidth" height="80" :viewBox="`0 0 ${svgWidth} 80`" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="white"/>
        <stop offset="100%" stop-color="gray"/>
      </linearGradient>
    </defs>
    <text
      id="id"
      x="50%"
      y="70%"
      text-anchor="middle"
      font-family="Montserrat, sans-serif"
      font-size="64"
      fill="url(#grad)"
      stroke="black"
      stroke-width="9"
      stroke-linejoin="round"
      paint-order="stroke fill"
    >0</text>
  </svg></template>

<script lang="ts" setup>
/*definePageMeta({
  middleware: 'auth' as any
})
*/
    import { saveScore } from '~/global/global';
    import type { World } from '@dimforge/rapier3d-compat';
    import * as THREE from 'three';
    import { onMounted } from 'vue';
    import type RAPIERtype from '@dimforge/rapier3d-compat'
    import { OBB } from 'three/examples/jsm/math/OBB.js';
    import { lerp, randInt } from 'three/src/math/MathUtils.js';
    const RAPIER = await import('@dimforge/rapier3d-compat')
    await RAPIER.init()
    const loader = new THREE.TextureLoader();
    type cubeholder = {
        Visual: THREE.Mesh,
        Hitbox: RAPIERtype.RigidBody,
        Box: THREE.Box3,
        OBBLocal: OBB,
        OBBWorld: OBB,
        Collider:RAPIERtype.Collider
    }
    type enemy = {
        Speed: number,
        Health: number,
        MaxHP: number,
    }
    const createdObjects: cubeholder[] = []
    const enemies: (enemy & cubeholder)[] = []
    const terrainPieces: cubeholder[] = [];

    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    function createObject(
        rotation: {x:number,y:number,z:number},
        position: {x:number,y:number,z:number},
        size: {x:number,y:number,z:number}, 
        color: number, 
        world: World, scene: THREE.Scene,
        type: number,
        shape: string,
        texture: string,
        enemydata?: enemy){

            const geo = (shape=="rect") ? new THREE.BoxGeometry(size.x,size.y,size.z)
            : new THREE.SphereGeometry(size.x/2, 32, 16)

            let material = new THREE.MeshStandardMaterial({color:color})
            if (texture){
                const textured = loader.load(`/${texture}`);
                material = new THREE.MeshStandardMaterial({color:color, map:textured})
            }
            
            const cube = new THREE.Mesh(geo, material)
            cube.castShadow = true;
            cube.receiveShadow = true;
            scene.add(cube)

            const initalrotation: THREE.Euler = new THREE.Euler(rotation.x, rotation.y, rotation.z)
            const quater: THREE.Quaternion = new THREE.Quaternion().setFromEuler(initalrotation)
            let hitboxdesc
            if (type===1){
                hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
            } else if (type===2){
                hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
            } else {
                hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
            }
            const coldesc = (shape=="rect") ? RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2)
            : RAPIER.ColliderDesc.ball(size.x/2)
            const collider = world.createCollider(coldesc, hitboxdesc)
            const box3 = new THREE.Box3().setFromObject(cube)

            cube.geometry.computeBoundingBox();
            const obbLocal = new OBB();
            obbLocal.fromBox3(cube.geometry.boundingBox!);
            const obbWorld = new OBB();
            cube.updateMatrixWorld();
            obbWorld.copy(obbLocal).applyMatrix4(cube.matrixWorld);

            const obj = {
                Visual: cube,
                Hitbox: hitboxdesc,
                Box: box3,
                OBBLocal: obbLocal,
                OBBWorld: obbWorld,
                Collider: collider
            };

            createdObjects.push(obj);

            if (type === 2) {
                terrainPieces.push(obj);
            }
            if (enemydata !== undefined){
                enemies.push({
                    Visual: cube, 
                    Hitbox: hitboxdesc,
                    Speed: enemydata.Speed,
                    Health: enemydata.Health,
                    MaxHP: enemydata.MaxHP,
                    Box: box3,
                    OBBLocal: obbLocal,
                    OBBWorld: obbWorld,
                    Collider:collider
                })
            }
            return {Collider: collider, Body: hitboxdesc, Visual: cube, Box: box3, OBBLocal: obbLocal, OBBWorld: obbWorld}
        }
    function lerpTo(a:number,b:number,t:number){
        return (b*t)+(1-t)*a
    }

    onMounted(()=>{
        const brij = new Audio('/bruh.mp3')
        const world = new RAPIER.World({x:0, y:-9.81, z:0})
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const textureLoader = new THREE.TextureLoader();

        textureLoader.load('/sky.png', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;

            scene.background = texture;
        });
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambient);
        // AI GENERATED
        function landPiece(
            prevEnd: THREE.Vector3,
            prevQuat: THREE.Quaternion,
            localRotation: { x: number; y: number; z: number },
            size: { x: number; y: number; z: number },
            texture: string
        ): { pos: THREE.Vector3, quat: THREE.Quaternion } {

            const localQuat = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(localRotation.x, localRotation.y, localRotation.z)
            );
            const quat = prevQuat.clone().multiply(localQuat);

            const halfOffset = new THREE.Vector3(0, -size.y / 2, -size.z / 2).applyQuaternion(quat);
            const center = prevEnd.clone().add(halfOffset);

            const euler = new THREE.Euler().setFromQuaternion(quat);
            createObject(
                { x: euler.x, y: euler.y, z: euler.z },
                { x: center.x, y: center.y, z: center.z },
                size, 0xFFFFFF, world, scene, 2, "rect", texture
            );

            return {
                pos: prevEnd.clone().add(new THREE.Vector3(0, 0, -size.z).applyQuaternion(quat)),
                quat
            };
        }
        //---------------------------------
        const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.camera.left = -200;
        sun.shadow.camera.right = 200;
        sun.shadow.camera.top = 200;
        sun.shadow.camera.bottom = -200;
        sun.shadow.camera.near = 0.1;
        sun.shadow.camera.far = 100;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        scene.add(sun);
        const hemi = new THREE.HemisphereLight(0x87ceeb, 0x444422, 0.5);
        scene.add(hemi);
        document.body.appendChild(renderer.domElement);
        camera.rotation.x = -0.45
        renderer.render(scene, camera)

        let plr = createObject({x: 0, y: 0, z: 0}, {x: 2, y: 2, z: 2}, {x:1,y:0,z:0}, 0xFFFFFF, world, scene, 1, "a", "rb4.png")
        const keysdown: Record<string,boolean> = {}
        window.addEventListener("keydown", (key: KeyboardEvent) => keysdown[key.code] = true)
        window.addEventListener("keyup", (key: KeyboardEvent) => keysdown[key.code] = false)
        function checkCollision(
            object: {OBBLocal: OBB, OBBWorld: OBB, Visual: THREE.Mesh},
            plr: {OBBLocal: OBB, OBBWorld: OBB, Visual: THREE.Mesh}
        ) {
            object.Visual.updateMatrixWorld();
            plr.Visual.updateMatrixWorld();
            object.OBBWorld.copy(object.OBBLocal).applyMatrix4(object.Visual.matrixWorld);
            plr.OBBWorld.copy(plr.OBBLocal).applyMatrix4(plr.Visual.matrixWorld);
            return object.OBBWorld.intersectsOBB(plr.OBBWorld);
        }

        let hp = 3
        let iframes = 0
        let reloading = false
        //AI GENERATED
        function clampedPitch(prevQuat: THREE.Quaternion, localRotation: {x:number, y:number, z:number}) {
            // Extract current pitch from accumulated quaternion
            const currentEuler = new THREE.Euler().setFromQuaternion(prevQuat, 'YXZ');
            const currentPitch = currentEuler.x;

            // Clamp so total pitch stays within ~±0.6 radians (~35 degrees)
            const maxPitch = 0.6;
            const minPitch = -0.6;
            const desiredPitch = currentPitch + localRotation.x;
            const clampedX = Math.max(minPitch, Math.min(maxPitch, desiredPitch)) - currentPitch;

            return { ...localRotation, x: clampedX };
        }
        const MIN_TERRAIN_Y = -10; // tune this — terrain won't go below this height

        function safeLandPiece(
            pos: THREE.Vector3,
            quat: THREE.Quaternion,
            rotation: {x:number, y:number, z:number},
            size: {x:number, y:number, z:number},
            texture: string
        ) {
            // If we're already near the floor, force flat (no downward pitch)
            const clampedRotation = pos.y <= MIN_TERRAIN_Y
                ? { ...rotation, x: Math.max(0, rotation.x) }  // only allow upward or flat pitch
                : rotation;

            return landPiece(pos, quat, clampedPitch(quat, clampedRotation), size, texture);
        }
        // Flat straight section
        function flat(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            let pos = start, quat = startQuat;
            const count = randInt(2, 5);
            for (let i = 0; i < count; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Gentle hill up and back down
        function hill(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0.5,  y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x: -0.5, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            return { pos: p4, quat: q4 }
        }

        // Steep sharp hill
        function steepHill(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0,   y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0.9, y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0,   y: 0, z: 0 }, { x: 20, y: 1, z: 10 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x:-0.9, y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            return { pos: p4, quat: q4 }
        }

        // Long downward slope
        function slope(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0.35, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0.35, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x: 0.35, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p5, quat: q5 } = safeLandPiece(p4,    q4,        { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            return { pos: p5, quat: q5 }
        }

        // 90 degree turn left or right
        function turn(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const options = [Math.PI / 2, -Math.PI / 2].filter(a => !wouldBacktrack(startQuat, a));
            const angle = options[randInt(0, options.length - 1)];
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0, y: 0,     z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0, y: angle,  z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0, y: 0,      z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            return { pos: p3, quat: q3 }
        }

        // Gradual curve (multiple small turns)
        function curve(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const options = [Math.PI / 8, -Math.PI / 8].filter(a => !wouldBacktrack(startQuat, a));
            const angle = options[randInt(0, options.length - 1)];
            let pos = start, quat = startQuat;
            for (let i = 0; i < 4; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: angle, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Narrow bridge
        function bridge(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            let pos = start, quat = startQuat;
            const { pos: entry, quat: eq } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 20, y: 1, z: 10 }, "grass.png");
            pos = entry; quat = eq;
            for (let i = 0; i < 4; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 6, y: 1, z: 10 }, "grass.png"));
            }
            return safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 20, y: 1, z: 10 }, "grass.png");
        }

        // Zigzag (alternating left-right turns)
        function zigzag(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const firstAngle = wouldBacktrack(startQuat, Math.PI / 2) ? -Math.PI / 2 : Math.PI / 2;
            let pos = start, quat = startQuat;
            for (let i = 0; i < 4; i++) {
                const angle = i % 2 === 0 ? firstAngle : -firstAngle;
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: angle, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png"));
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0,     z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Bumpy road (small rapid undulations)
        function bumpy(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const tilts = [0.3, -0.3, 0.25, -0.25, 0.2, -0.2];
            let pos = start, quat = startQuat;
            for (const tilt of tilts) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: tilt, y: 0, z: 0 }, { x: 20, y: 1, z: 10 }, "grass.png"));
            }
            return { pos, quat };
        }
        // Stairs going up
        function stairsUp(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            let pos = start, quat = startQuat;
            for (let i = 0; i < 6; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 20, y: 2, z: 8 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Stairs going down
        function stairsDown(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            let pos = start, quat = startQuat;
            // drop the start point down first
            pos = new THREE.Vector3(pos.x, pos.y - 12, pos.z).add(
                new THREE.Vector3(0, 0, -8).applyQuaternion(quat)
            );
            for (let i = 0; i < 6; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 20, y: 2, z: 8 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Wide open plateau — flat and wide
        function plateau(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0.4, y: 0, z: 0 }, { x: 40, y: 1, z: 15 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0,   y: 0, z: 0 }, { x: 40, y: 1, z: 30 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0,   y: 0, z: 0 }, { x: 40, y: 1, z: 30 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x:-0.4, y: 0, z: 0 }, { x: 40, y: 1, z: 15 }, "grass.png")
            return { pos: p4, quat: q4 }
        }

        // Narrow ridge — thin and scary
        function ridge(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0.5, y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            let pos = p1, quat = q1;
            for (let i = 0; i < 4; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: 4, y: 1, z: 12 }, "grass.png"));
            }
            const { pos: pL, quat: qL } = safeLandPiece(pos, quat, { x: -0.5, y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            return { pos: pL, quat: qL }
        }

        // S-curve
        function sCurve(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const firstAngle = wouldBacktrack(startQuat, Math.PI / 6) ? -Math.PI / 6 : Math.PI / 6;
            let pos = start, quat = startQuat;
            for (let i = 0; i < 3; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: firstAngle,  z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png"));
            }
            for (let i = 0; i < 3; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: -firstAngle, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Valley — dips down then comes back up
        function valley(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x:-0.5, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x:-0.3, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0,   y: 0, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x: 0.3, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p5, quat: q5 } = safeLandPiece(p4,    q4,        { x: 0.5, y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            return { pos: p5, quat: q5 }
        }

        // Spiral descent — curves and drops at the same time
        function spiralDown(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const options = [Math.PI / 5, -Math.PI / 5].filter(a => !wouldBacktrack(startQuat, a));
            const angle = options[randInt(0, options.length - 1)];
            let pos = start, quat = startQuat;
            for (let i = 0; i < 6; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: -0.2, y: angle, z: 0 }, { x: 20, y: 1, z: 18 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Chicane — tight left then right (or reverse)
        function chicane(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const firstAngle = wouldBacktrack(startQuat, Math.PI / 3) ? -Math.PI / 3 : Math.PI / 3;
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0, y: 0,           z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0, y: firstAngle,  z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0, y: -firstAngle, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x: 0, y: 0,           z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png")
            return { pos: p4, quat: q4 }
        }

        // Rolling hills — several gentle ups and downs
        function rollingHills(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const waves = [0.3, -0.3, 0.3, -0.3, 0.3, -0.3];
            let pos = start, quat = startQuat;
            for (const tilt of waves) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: tilt, y: 0, z: 0 }, { x: 20, y: 1, z: 18 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Ramp up to a flat roof then off the edge
        function rooftop(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const { pos: p1, quat: q1 } = safeLandPiece(start, startQuat, { x: 0.6,  y: 0, z: 0 }, { x: 20, y: 1, z: 12 }, "grass.png")
            const { pos: p2, quat: q2 } = safeLandPiece(p1,    q1,        { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p3, quat: q3 } = safeLandPiece(p2,    q2,        { x: 0,    y: 0, z: 0 }, { x: 20, y: 1, z: 20 }, "grass.png")
            const { pos: p4, quat: q4 } = safeLandPiece(p3,    q3,        { x:-0.6,  y: 0, z: 0 }, { x: 20, y: 1, z: 12 }, "grass.png")
            return { pos: p4, quat: q4 }
        }

        // Corkscrew — bank left while going up, then unwind
        function corkscrew(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const options = [Math.PI / 7, -Math.PI / 7].filter(a => !wouldBacktrack(startQuat, a));
            const yaw = options[randInt(0, options.length - 1)];
            let pos = start, quat = startQuat;
            for (let i = 0; i < 4; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0.25, y: yaw,  z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png"));
            }
            for (let i = 0; i < 4; i++) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x:-0.25, y: -yaw, z: 0 }, { x: 20, y: 1, z: 15 }, "grass.png"));
            }
            return { pos, quat };
        }

        // Narrow path that widens back out
        function funnel(start: THREE.Vector3, startQuat: THREE.Quaternion) {
            const widths = [20, 14, 8, 5, 5, 8, 14, 20];
            let pos = start, quat = startQuat;
            for (const w of widths) {
                ({ pos, quat } = safeLandPiece(pos, quat, { x: 0, y: 0, z: 0 }, { x: w, y: 1, z: 10 }, "grass.png"));
            }
            return { pos, quat };
        }
        function wouldBacktrack(currentQuat: THREE.Quaternion, turnY: number): boolean {
            const testQuat = currentQuat.clone().multiply(
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, turnY, 0))
            );
            const currentForward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentQuat);
            const newForward = new THREE.Vector3(0, 0, -1).applyQuaternion(testQuat);
            return currentForward.dot(newForward) < 0;
        }
        const terrainTypes = [
            flat, hill, steepHill, slope, turn, curve, bridge, zigzag, bumpy,
            stairsUp, plateau, ridge, sCurve, valley, chicane,
            rollingHills, rooftop, corkscrew, funnel, spiralDown, stairsDown
        ];

        let prev = new THREE.Vector3(0, 0, 20);
        let prevQuat = new THREE.Quaternion();
        let prevnum = -1;

        const terrainPieces: cubeholder[] = [];

        function generateChunk(count:number,start?:boolean) {
            let pick
            for (let i = 0; i < count; i++) {
                if (!start){
                let rand = randInt(0, terrainTypes.length - 1);
                while (rand === prevnum) {
                    rand = randInt(0, terrainTypes.length - 1);
                }
                prevnum = rand;
                
                // If terrain is low, force a flat or upward section instead
                const tooLow = prev.y < MIN_TERRAIN_Y + 5;
                pick = tooLow ? (hill) : (terrainTypes[rand] ?? flat);
            }else{
                pick = flat
            }
                const result = pick(prev, prevQuat);
                prev = result.pos;
                prevQuat = result.quat;
            }
        }
        generateChunk(3,true);
        generateChunk(3)
        //------------------
        let delay = 0
        let spawned = false
        let points = 0
        const animate = (): void => {
            requestAnimationFrame(animate)
            world.step()
            if (!reloading){
                const velocitycurrent = plr.Body.linvel()
                const candidatex = Math.max(0.025,Math.abs(velocitycurrent.x)/100)
                const candidatez = Math.max(0.025,Math.abs(velocitycurrent.z)/100)
                points += (candidatex>=candidatez)?candidatex:candidatez
                const scoreboard = document.getElementById("id")
                if (scoreboard)scoreboard.textContent = `${Math.round(points)}`
            }
            const playerPos = plr.Visual.position;
            if (playerPos.distanceTo(prev) < 150) {
                generateChunk(5);
                for (let i = 0; i < 5; i++) {
                    createObject({x: 0, y: 0, z: 0}, {x: randInt(-25,25)+plr.Visual.position.x, y: randInt(30,60)+plr.Visual.position.y, z: randInt(-25,25)+plr.Visual.position.z}, {x:1,y:1,z:1}, 0xFFFFFF, world, scene, 1, "rect", "evil.png", {Speed:randInt(60,105)/10, Health:1, MaxHP:1})  
                }

            }
            if (delay < 500){
                delay +=1
            }else if (!spawned){
                spawned = true
                for (let i = 1; i < 75; i++) {
                    createObject({x: 0, y: 0, z: 0}, {x: randInt(-25,25), y: randInt(30,60), z: randInt(-25,25)}, {x:1,y:1,z:1}, 0xFFFFFF, world, scene, 1, "rect", "evil.png", {Speed:randInt(60,105)/10, Health:1, MaxHP:1})  
                }
            }
            iframes = Math.max(0,iframes-1)
            createdObjects.forEach((x)=>{
                const pos = x.Hitbox.translation()
                const rot = x.Hitbox.rotation()
                x.Visual.position.set(pos.x, pos.y, pos.z)
                x.Visual.quaternion.set(rot.x, rot.y, rot.z, rot.w)
                x.Visual.updateMatrixWorld();
                x.OBBWorld.copy(x.OBBLocal).applyMatrix4(x.Visual.matrixWorld);
            })
            enemies.forEach((x)=>{
                const lookVector = new THREE.Vector3()
                .subVectors((!reloading)?plr.Visual.position:camera.position, x.Visual.position)
                .normalize()
                .multiplyScalar((!reloading)?x.Speed/10:5);
                x.Hitbox.applyImpulse(lookVector, true)
                if (checkCollision({OBBLocal:x.OBBLocal, OBBWorld:x.OBBWorld, Visual:x.Visual}, {OBBLocal:plr.OBBLocal, OBBWorld:plr.OBBWorld, Visual:plr.Visual}) && !reloading && iframes==0){
                    iframes=120
                    hp--

                }
            })
            if (hp==3){
                plr.Visual.material.color.setRGB(1,1,1)
            }else if(hp ==2){
                plr.Visual.material.color.setRGB(1,0.3,0.3)
            }else if(hp==1){
                plr.Visual.material.color.setRGB(1,0,0)
            }
            if ((hp==0||plr.Visual.position.y<-40)&&!reloading){
                reloading = true
                saveScore(supabase, user, points)
                for (let i=1;i<100;i++){
                    createObject({x: 0, y: 0, z: 0}, {x: plr.Visual.position.x+randInt(-1,1)/10000, y: plr.Visual.position.y+randInt(-1,1)/10000, z: plr.Visual.position.z+randInt(-1,1)/10000}, {x:0.3,y:0.3,z:0.3}, 0xFFFFFF, world, scene, 1, "a", "rb4.png")    
                }

            }
            if (!reloading){
                const dir = new THREE.Vector3()

                const forward = new THREE.Vector3()
                camera.getWorldDirection(forward)
                forward.y = 0
                forward.normalize()

                const right = new THREE.Vector3()
                right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

                if (keysdown['KeyW']) dir.add(forward)
                if (keysdown['KeyS']) dir.sub(forward)

                if (keysdown['KeyD']) dir.add(right)
                if (keysdown['KeyA']) dir.sub(right)

                if (dir.lengthSq() > 0) {
                    dir.normalize().multiplyScalar(0.001)

                    const force = new RAPIER.Vector3(
                        dir.x * 50,
                        0,
                        dir.z * 50
                    )

                    plr.Body.applyImpulse(force, true)
                }
                const pos = plr.Body.translation()

                const origin = {
                    x: pos.x,
                    y: pos.y - 0.9,
                    z: pos.z
                }

                const ray = new RAPIER.Ray(origin, {x: 0, y: -1, z: 0})
                const hit = world.castRay(ray, 0.15, true)
                const grounded = hit !== null
                if (keysdown['Space'] && grounded) {
                    plr.Body.applyImpulse({x: 0, y: 1.5, z: 0}, true)
                }
                dir.normalize().multiplyScalar(0.0025);
                const force = new RAPIER.Vector3(dir.x * 50, 0, dir.z * 50)
                plr.Body.applyImpulse(force, true)
                camera.position.x = lerpTo(camera.position.x,plr.Visual.position.x,0.025)
                camera.position.y = lerpTo(camera.position.y,plr.Visual.position.y+10,0.025)
                camera.position.z = lerpTo(camera.position.z,plr.Visual.position.z,0.025)
                
                const temp = new THREE.PerspectiveCamera();

                temp.position.copy(camera.position);
                temp.lookAt(plr.Visual.position);
                
                const quaternion = temp.quaternion.clone();
                camera.quaternion.slerp(temp.quaternion, 0.04);
            }
            const p = plr.Body.translation()
            const r = plr.Body.rotation()
            plr.Visual.position.set(p.x, p.y, p.z)
            plr.Visual.quaternion.set(r.x, r.y, r.z, r.w)
            while (terrainPieces.length > 300) {

                const old = terrainPieces.shift();

                if (!old) break;

                scene.remove(old.Visual);

                world.removeCollider(old.Collider, true);
                world.removeRigidBody(old.Hitbox);

                const idx = createdObjects.indexOf(old);

                if (idx !== -1) {
                    createdObjects.splice(idx, 1);
                }
            }
            renderer.render(scene, camera)
            
        }
        animate()
    })
</script>

<style scoped>
</style>