<template>
    <div class = "flex justify-center align-middle p-10">
        <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
            <img
            class = "w-50"
            src="/placeholder.jpg"
            alt="pfp" />
        </figure>
        <div class="card-body">
            <h2 class="card-title text-center">Profile Picture</h2>
            <p>Upload a profile picture here below.</p>
            <div class="card-actions justify-end">
                <input type="file" class="file-input" />
            </div>
        </div>
        </div>
    </div>
</template>

<script lang = "ts" setup>
const props = defineProps({
    username: String
})


</script>

<style scoped>
</style>