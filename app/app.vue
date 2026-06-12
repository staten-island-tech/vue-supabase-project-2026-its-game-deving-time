<template>
  <ClientOnly>
    <div class = "w-full h-full" :class="darkMode ? 'bg-black' : 'bg-white'">
      <NuxtPage/>
    </div>
  </ClientOnly>
</template>

<script lang = "ts" setup>
import { darkMode, downloadPreferences} from './global/global';
import { computed } from 'vue'
const supabase = useSupabaseClient()
const user = useSupabaseUser()


downloadPreferences(supabase, user)

useHead({
  bodyAttrs: {
    class: computed(() => darkMode.value ? '!bg-black text-white' : '!bg-white text-black')
  }
})
</script>