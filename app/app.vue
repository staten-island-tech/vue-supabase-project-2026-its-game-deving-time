<template>
  <div class = "w-full h-full" :class="darkMode ? 'bg-black' : 'bg-white'">
    <NuxtPage/>
  </div>
</template>

<script lang = "ts" setup>
import { darkMode, toggleDark } from './global/global';
import { computed } from 'vue'


useHead({
  bodyAttrs: {
    class: computed(() => darkMode.value ? '!bg-black text-white' : '!bg-white text-black')
  }
})
</script>