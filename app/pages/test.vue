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
    const RAPIER = await import('@dimforge/rapier3d-compat')
    await RAPIER.init()
    type cubeholder = {
        Visual: THREE.Mesh,
        Hitbox: RAPIERtype.RigidBody,
    }
    const createdcubes: cubeholder[] = []
    function createCube(rotation:{x:number,y:number,z:number},position:{x:number,y:number,z:number},size:number, color:number, world:World,scene:THREE.Scene,type:number,shape:string){
        const geo = (shape=="cube")?new THREE.BoxGeometry(size,size,size)
        :new THREE.BoxGeometry(size,size,size)

        

        const material = new THREE.MeshBasicMaterial({color: color})
        const cube = new THREE.Mesh(geo,material)
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
        const collider = world.createCollider(RAPIER.ColliderDesc.cuboid(size/2, size/2, size/2), hitboxdesc)
        createdcubes.push({Visual: cube, Hitbox: hitboxdesc})
        return {Collider:collider,Body:hitboxdesc,Visual:cube}
    }



    onMounted(()=>{
        const clock = new THREE.Clock();
        const world = new RAPIER.World({x:0,y:-9.81,z:0})
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        camera.rotation.x = -0.5
        renderer.render(scene,camera)
        const groundgeo = new THREE.BoxGeometry(50,1,50)
        const groundcolor = new THREE.MeshBasicMaterial({color:0x123881})
        const ground = new THREE.Mesh(groundgeo,groundcolor)
        ground.position.y = -5
        scene.add(ground)
        const grobox = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0,-5,0))
        world.createCollider(RAPIER.ColliderDesc.cuboid(25, 0.5, 25), grobox)

        const plr = createCube({x: Math.PI/3, y: Math.PI/3, z: Math.PI/3}, {x: 2, y: 2, z: 2}, 1, 0x00FF, world, scene,1)
        const keysdown:Record<string,boolean> = {}
        window.addEventListener("keydown",(key:KeyboardEvent)=>{keysdown[key.code] = true;console.log(key.code)})
        window.addEventListener("keyup",(key:KeyboardEvent)=>keysdown[key.code] = false)


        let isJumping: Boolean = false
        const animate = (): void => {
            requestAnimationFrame(animate)
            world.step()
            createdcubes.forEach((x)=>{
                const pos = x.Hitbox.translation()
                const rot = x.Hitbox.rotation()
                x.Visual.position.set(pos.x, pos.y, pos.z)
                x.Visual.quaternion.set(rot.x, rot.y, rot.z, rot.w)
            })
            const pos2 = grobox.translation()
            const rot2 = grobox.rotation()
            ground.position.set(pos2.x, pos2.y, pos2.z)
            ground.quaternion.set(rot2.x, rot2.y, rot2.z, rot2.w)
            const dt = clock.getDelta();
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
            if (hit) {
                isJumping = false
            }
             if (keysdown['Space'] && !isJumping && grounded) {
                plr.Body.applyImpulse({ x: 0, y: 1, z: 0 }, true)
                isJumping = true
            }
            dir.normalize().multiplyScalar(0.0025);
            if (keysdown['KeyE']){camera.position.y += 1}
            if (keysdown['KeyQ']){camera.position.y -= 1}
            const force = new RAPIER.Vector3(dir.x * 50, 0, dir.z * 50)
            plr.Body.applyImpulse(force, true)
            const p = plr.Body.translation()
            const r = plr.Body.rotation()
            plr.Visual.position.set(p.x, p.y, p.z)
            plr.Visual.quaternion.set(r.x, r.y, r.z, r.w)
            camera.position.x = plr.Visual.position.x
            camera.position.y = plr.Visual.position.y+3
            
            camera.position.z = plr.Visual.position.z+3
            renderer.render(scene, camera)
        }
        animate()
    })
</script>

<style scoped></style>
