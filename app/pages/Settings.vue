<template>
<div class = "flex flex-col items-center p-10 overflow-y">
    <div class="card w-200 shadow-sm">
        <div class="flex flex-row card-body">
            <div class = "flex flex-col w-[70%] justify-center items-center">
                <h2 class="card-title">Dark Mode</h2>
                <p>Make everything extremely dark and scary. Not for people who are afraid of the dark.</p>
            </div>
            <div class = "flex items-center justify-center w-[30%]">
                <input type="checkbox" v-model = "preferences.darkMode" :checked="darkMode" @click = "toggleDark" class="toggle toggle-warning" />
            </div>

        </div>
    </div>
</div>

<!-- 
colors from daisyui to use
<input type="checkbox" checked="checked" class="toggle toggle-primary" />
<input type="checkbox" checked="checked" class="toggle toggle-secondary" />
<input type="checkbox" checked="checked" class="toggle toggle-accent" />
<input type="checkbox" checked="checked" class="toggle toggle-neutral" />

<input type="checkbox" checked="checked" class="toggle toggle-info" />
<input type="checkbox" checked="checked" class="toggle toggle-success" />
<input type="checkbox" checked="checked" class="toggle toggle-warning" />
<input type="checkbox" checked="checked" class="toggle toggle-error" /> 
-->






</template>

<script lang = "ts" setup>
import { darkMode, toggleDark } from '~/global/global';

const preferences = reactive({
    darkMode: false,
})


</script>

<style scoped>

</style>