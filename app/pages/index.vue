<template>
    <div class = "flex fixed bg-blue-500 w-full justify-center">
      <!-- Navagation -->
    <div class="navbar bg-base-100 shadow-sm">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
        </button>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">Red Ball 99</a>
      </div>
      <div class="flex-none">
        <button class="btn" @click = "status = `L`">Log In</button>
        <button class="btn" @click = "status = `S`">Sign Up</button>
        <button class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path> </svg>
        </button>
      </div>
    </div>
    </div>
    <!-- Login (and no this comment isn't AI generated) -->
    <div class = "flex flex-col justify-center items-center w-full h-screen bg-amber-500 p-5">
      <signin v-if="status === `S`"></signin>
      <login v-if="status === `L`"></login>
    </div>
</template>

<script setup>
import login from './login.vue';
import signin from './signin.vue';
import { status } from '~/global/global';

</script>

<style scoped>
</style>