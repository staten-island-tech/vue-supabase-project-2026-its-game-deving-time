<template>
    <h1>What</h1>
</template>

<script lang="ts" setup>
    import type { World } from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
    import { onMounted, render } from 'vue';
    import type RAPIERtype from '@dimforge/rapier3d-compat'
import type { RapierHelper } from 'three/examples/jsm/Addons.js';
import { PI } from 'three/tsl';
import { randInt } from 'three/src/math/MathUtils.js';
    const RAPIER = await import('@dimforge/rapier3d-compat')
    await RAPIER.init()
    const loader = new THREE.TextureLoader();
    type cubeholder = {
        Visual: THREE.Mesh,
        Hitbox: RAPIERtype.RigidBody,
        Box:THREE.Box3
    }
    type enemy = {
        Speed: number,
        Health: number,
        MaxHP: number,
    }
    const createdObjects: cubeholder[] = []
    const enemies: (enemy&cubeholder)[] = []
    function createObject(
    rotation:{x:number,y:number,z:number},
    position:{x:number,y:number,z:number},
    size:{x:number,y:number,z:number}, 
    color:number, 
    world:World,scene:THREE.Scene,
    type:number,
    shape:string,
    texture:string,
    enemydata?:enemy){

        const geo = (shape=="rect")?new THREE.BoxGeometry(size.x,size.y,size.z)
        :new THREE.SphereGeometry(size.x/2, 32, 16)

        let material = new THREE.MeshStandardMaterial({color:color})
        if (texture){
            const textured = loader.load(`/${texture}`);
            material = new THREE.MeshStandardMaterial({color:color,map:textured})
        }
        
        const cube = new THREE.Mesh(geo,material)
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube)

        const initalrotation:THREE.Euler = new THREE.Euler(rotation.x,rotation.y,rotation.z)
        const quater:THREE.Quaternion = new THREE.Quaternion().setFromEuler(initalrotation)
        let hitboxdesc
        if (type===1){
            hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
        } else if (type===2){
            hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
        } else{
            hitboxdesc = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position.x,position.y,position.z).setRotation({x:quater.x,y:quater.y,z:quater.z,w:quater.w}))
        }
        const coldesc = (shape=="rect")?RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2)
        :RAPIER.ColliderDesc.ball(size.x/2)
        const collider = world.createCollider(coldesc, hitboxdesc)
        const box3 = new THREE.Box3().setFromObject(cube)
        createdObjects.push({Visual: cube, Hitbox: hitboxdesc,Box:box3})
        if (enemydata!==undefined){
            enemies.push({
                Visual: cube, 
                Hitbox: hitboxdesc,
                Speed: enemydata.Speed,
                Health: enemydata.Health,
                MaxHP: enemydata.MaxHP,
                Box:box3
            })
        }
        return {Collider:collider,Body:hitboxdesc,Visual:cube,Box:box3}
    }

    onMounted(()=>{
        const brij = new Audio('/bruh.mp3')
        const world = new RAPIER.World({x:0,y:-9.81,z:0})
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
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
        document.body.appendChild( renderer.domElement );
        camera.rotation.x = -0.825
        renderer.render(scene,camera)
        const ground = createObject({x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}, {x:50,y:1,z:50}, 0xFFFFFF, world, scene,2,"rect","grass.png")
        let plr = createObject({x: 0, y: 0, z: 0}, {x: 2, y: 2, z: 2}, {x:1,y:0,z:0}, 0xFFFFFF, world, scene,1,"a","rb4.png")
        const keysdown:Record<string,boolean> = {}
        window.addEventListener("keydown",(key:KeyboardEvent)=>keysdown[key.code] = true)
        window.addEventListener("keyup",(key:KeyboardEvent)=>keysdown[key.code] = false)
        createObject({x: 0, y: 0, z: 0}, {x: randInt(-25,25), y: randInt(30,60), z: randInt(-25,25)}, {x:1,y:1,z:1}, 0xFFFFFF, world, scene,1,"rect","evil.png",{Speed:1,Health:1,MaxHP:1})     
        
        function checkCollision(object:{Box:THREE.Box3,Mesh:THREE.Mesh},plr:{Box:THREE.Box3,Mesh:THREE.Mesh}) {
            const sphere = new THREE.Sphere()
            const sphere2 = new THREE.Sphere()
            object.Box.setFromObject(object.Mesh);
            plr.Box.setFromObject(plr.Mesh).getBoundingSphere(sphere);
            console.log(object.Box.intersectsSphere(sphere))
            return object.Box.intersectsSphere(sphere)
        }
        let reloading = false
        const animate = (): void => {
            requestAnimationFrame(animate)
            world.step()
            createdObjects.forEach((x)=>{
                const pos = x.Hitbox.translation()
                const rot = x.Hitbox.rotation()
                x.Visual.position.set(pos.x, pos.y, pos.z)
                x.Visual.quaternion.set(rot.x, rot.y, rot.z, rot.w)
            })
            enemies.forEach((x)=>{
                const lookVector = new THREE.Vector3()
                .subVectors(plr.Visual.position, x.Visual.position)
                .normalize()
                .multiplyScalar(x.Speed/10);;
                x.Hitbox.applyImpulse(lookVector, true)
                if (checkCollision({Box:x.Box,Mesh:x.Visual},{Box:plr.Box,Mesh:plr.Visual})==true&&!reloading){
                    reloading = true
                    location.reload()
                }
            })
            
            const pos2 = ground.Body.translation()
            const rot2 = ground.Body.rotation()
            ground.Visual.position.set(pos2.x, pos2.y, pos2.z)
            ground.Visual.quaternion.set(rot2.x, rot2.y, rot2.z, rot2.w)

            const dir = new THREE.Vector3();
            if (keysdown['KeyW']){ dir.z -= 1};
            if (keysdown['KeyS']) dir.z += 1;
            if (keysdown['KeyA']) dir.x -= 1;
            if (keysdown['KeyD']) dir.x += 1;
            const pos = plr.Body.translation()

            const origin = {
                x: pos.x,
                y: pos.y - 0.9,
                z: pos.z
            }

            const ray = new RAPIER.Ray(origin, { x: 0, y: -1, z: 0 })
            const hit = world.castRay(ray, 0.15, true)
            const grounded = hit !== null
            if (keysdown['Space'] && grounded) {
                plr.Body.applyImpulse({ x: 0, y: 1, z: 0 }, true)
            }
            dir.normalize().multiplyScalar(0.0025);
            const force = new RAPIER.Vector3(dir.x * 50, 0, dir.z * 50)
            plr.Body.applyImpulse(force, true)
            const p = plr.Body.translation()
            const r = plr.Body.rotation()
            plr.Visual.position.set(p.x, p.y, p.z)
            plr.Visual.quaternion.set(r.x, r.y, r.z, r.w)
            camera.position.x = plr.Visual.position.x
            camera.position.y = plr.Visual.position.y+6
            
            camera.position.z = plr.Visual.position.z+6
            renderer.render(scene, camera)
        }
        animate()
    })
</script>

<style scoped></style>
