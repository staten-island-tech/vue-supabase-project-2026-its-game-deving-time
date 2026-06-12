<template>
  <NuxtPage/>
</template>

<script lang="ts" setup>
import { darkMode, downloadPreferences } from './global/global'
import { computed } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

if (user.value) {
  await downloadPreferences(supabase, user)
}

useHead({
  bodyAttrs: {
    class: computed(() => darkMode.value ? '!bg-black text-white' : '!bg-white text-black')
  }
})
</script>