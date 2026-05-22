<template>
    <h1>What</h1>
</template>

<script lang="ts" setup>
    import type { World } from '@dimforge/rapier3d-compat';
    import * as THREE from 'three';
    import { onMounted } from 'vue';
    import type RAPIERtype from '@dimforge/rapier3d-compat'
    import { OBB } from 'three/examples/jsm/math/OBB.js';
    import { randInt } from 'three/src/math/MathUtils.js';
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

            createdObjects.push({Visual: cube, Hitbox: hitboxdesc, Box: box3, OBBLocal: obbLocal, OBBWorld: obbWorld,Collider:collider})
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

        const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.camera.left = -30;
        sun.shadow.camera.right = 30;
        sun.shadow.camera.top = 30;
        sun.shadow.camera.bottom = -30;
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
        createObject({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, {x:25,y:1,z:25}, 0xFFFFFF, world, scene, 2, "rect", "grass.png")
        createObject({x: 0.45, y: 0, z: 0}, {x: 0, y: 5, z: -22}, {x:25,y:1,z:25}, 0xFFFFFF, world, scene, 2, "rect", "grass.png")
        createObject({x: 0, y: 0, z: 0}, {x: 0, y: 10.35, z: -37.9}, {x:25,y:1,z:10}, 0xFFFFFF, world, scene, 2, "rect", "grass.png")
        createObject({x: -0.45, y: 0, z: 0}, {x: 0, y: 5, z: -47.9}, {x:25,y:1,z:10}, 0xFFFFFF, world, scene, 2, "rect", "grass.png")

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
        //createObject({x: 0, y: 0, z: 0}, {x: randInt(-25,25), y: randInt(30,60), z: randInt(-25,25)}, {x:1,y:1,z:1}, 0xFFFFFF, world, scene, 1, "rect", "evil.png", {Speed:1, Health:1, MaxHP:1})  
        let hp = 3
        let iframes = 0
        let reloading = false
        const animate = (): void => {
            requestAnimationFrame(animate)
            world.step()
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
                if (x.Visual.position.distanceTo(plr.Visual.position)<=30){
                    const lookVector = new THREE.Vector3()
                    .subVectors(plr.Visual.position, x.Visual.position)
                    .normalize()
                    .multiplyScalar(x.Speed/10);
                    x.Hitbox.applyImpulse(lookVector, true)
                }
                if (checkCollision({OBBLocal:x.OBBLocal, OBBWorld:x.OBBWorld, Visual:x.Visual}, {OBBLocal:plr.OBBLocal, OBBWorld:plr.OBBWorld, Visual:plr.Visual}) && !reloading && iframes==0){
                    iframes=120
                    hp--
                    if (hp==0){
                        reloading = true
                        for (let i=1;i<100;i++){
                            createObject({x: 0, y: 0, z: 0}, {x: plr.Visual.position.x+randInt(-1,1)/10000, y: plr.Visual.position.y+randInt(-1,1)/10000, z: plr.Visual.position.z+randInt(-1,1)/10000}, {x:0.3,y:0.3,z:0.3}, 0xFFFFFF, world, scene, 1, "a", "rb4.png")    
                        }

                    }
                }
            })
            if (hp==3){
                plr.Visual.material.color.setRGB(1,1,1)
            }else if(hp ==2){
                plr.Visual.material.color.setRGB(1,0.3,0.3)
            }else if(hp==1){
                plr.Visual.material.color.setRGB(1,0,0)
            }
            if (hp>0){
                const dir = new THREE.Vector3();
                if (keysdown['KeyW']) dir.z -= 1;
                if (keysdown['KeyS']) dir.z += 1;
                if (keysdown['KeyA']) dir.x -= 1;
                if (keysdown['KeyD']) dir.x += 1;
                if (keysdown['KeyF']) camera.rotation.y += 0.05;
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
                    plr.Body.applyImpulse({x: 0, y: 1, z: 0}, true)
                }
                dir.normalize().multiplyScalar(0.0025);
                const force = new RAPIER.Vector3(dir.x * 50, 0, dir.z * 50)
                plr.Body.applyImpulse(force, true)
            }
            const p = plr.Body.translation()
            const r = plr.Body.rotation()
            plr.Visual.position.set(p.x, p.y, p.z)
            plr.Visual.quaternion.set(r.x, r.y, r.z, r.w)
            if (hp>0){
            camera.position.x = plr.Visual.position.x
            camera.position.y = plr.Visual.position.y + 8
            camera.position.z = plr.Visual.position.z + 12
            }
            renderer.render(scene, camera)
        }
        animate()
    })
</script>

<style scoped></style>