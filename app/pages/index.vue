<template>
    <div class = "flex justify-center">
        <h3 class = "text-blue-600"><b>Project</b></h3>
    </div>
</template>

<script lang="ts" setup>
    import * as THREE from 'three';
    import { onMounted } from 'vue';   
    const RAPIER = await import('@dimforge/rapier3d-compat')
    await RAPIER.init()

    
    onMounted(()=>{
        // gravity control
        const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })

        // keybind handler!!!!!!!!!!!!!!
        const controller = world.createCharacterController(0.01);

        // determines the direction of the world
        controller.setUp({ x: 0, y: 1, z: 0 });

        // slope detection
        controller.setMaxSlopeClimbAngle(45 * Math.PI / 180);
        controller.setMinSlopeSlideAngle(30 * Math.PI / 180);

        // height that the player can just walk up without jumping
        controller.enableAutostep(0.5, 0.2, true);
        controller.enableSnapToGround(0.5);

        // cube physics setup
        // position creation
        const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(0, 2, 0);
        // rotation creation (radians)
        const euler = new THREE.Euler(Math.PI / 3, Math.PI / 3, Math.PI / 3);
        const q = new THREE.Quaternion().setFromEuler(euler);
        const boxBody = world.createRigidBody(
            RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
        )

        // ground
        const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
        world.createCollider(RAPIER.ColliderDesc.cuboid(10, 0.1, 10), groundBody)
        world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), boxBody)

        // make it so the player can actually view the objects
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        // player creation
        const body = world.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.3); // halfHeight, radius
        const collider = world.createCollider(colliderDesc, body);

        // create another capsule inside of three js so you can see yourself
        const mesh = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 1, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        // insert player into view
        scene.add(mesh);

        //KEYBIND DETECTION
        const keys: Record<string, boolean> = {};
        // if a key is pressed, set it to true, if it is released, set it to false
        window.addEventListener('keydown', (e: KeyboardEvent) => keys[e.code] = true);
        window.addEventListener('keyup',   (e: KeyboardEvent) => keys[e.code] = false);

        // jumping
        const velocity = new THREE.Vector3();
        const SPEED = 5;
        const JUMP_FORCE = 8;
        const GRAVITY = -20;

        function update(dt: number) {
        // movement
        const dir = new THREE.Vector3();
        if (keys['KeyW']) dir.z -= 1;
        if (keys['KeyS']) dir.z += 1;
        if (keys['KeyA']) dir.x -= 1;
        if (keys['KeyD']) dir.x += 1;
        dir.normalize().multiplyScalar(SPEED);

        // Gravity
        velocity.y += GRAVITY * dt;

        // Jump
        if (keys['Space'] && controller.computedGrounded()) {
            velocity.y = JUMP_FORCE;
        }

        const movement = new THREE.Vector3(dir.x * dt, velocity.y * dt, dir.z * dt);

        // Let Rapier compute the actual movement (handles collisions)
        controller.computeColliderMovement(collider, {
            x: movement.x,
            y: movement.y,
            z: movement.z,
        });

        const computed = controller.computedMovement();

        // If we hit the ground, reset vertical velocity
        if (controller.computedGrounded()) velocity.y = 0;

        // Apply to kinematic body
        const pos = body.translation();
        body.setNextKinematicTranslation({
            x: pos.x + computed.x,
            y: pos.y + computed.y,
            z: pos.z + computed.z,
        });

        // Sync Three.js mesh
        const p = body.translation();
        mesh.position.set(p.x, p.y, p.z);
        }
        const cameraOffset = new THREE.Vector3(0, 3, 6);

        function updateCamera() {
        const target = mesh.position.clone().add(cameraOffset);
        camera.position.lerp(target, 0.1); // smooth follow
        camera.lookAt(mesh.position);
        }
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        const geo = new THREE.BoxGeometry(1,1,1)
        const color = new THREE.MeshBasicMaterial({color: 0xFFFFFF})
        const cube = new THREE.Mesh(geo,color)
        camera.position.z = 1
        camera.position.y = 5
        camera.rotation.x = 5
        scene.add(cube)
        const clock = new THREE.Clock();
        const animate = (): void => {
            requestAnimationFrame(animate)
            const dt = clock.getDelta();

            update(dt);
            world.step()
            updateCamera();
            const pos = boxBody.translation()
            const rot = boxBody.rotation()

            cube.position.set(pos.x, pos.y, pos.z)
            cube.quaternion.set(rot.x, rot.y, rot.z, rot.w)

            renderer.render(scene, camera)
            }
            animate()
        })
</script>

<style scoped>
</style>