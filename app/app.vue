<template>
  <NuxtPage/>
</template>

<script lang="ts" setup>
import { darkMode, downloadPreferences } from './global/global'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

watch(user, (newUser) => {
  if (newUser) {
    downloadPreferences(supabase, user)
  }
}, { immediate: true })

watch(darkMode, (val) => {
  if (import.meta.client) {
    document.body.className = val ? '!bg-black text-white' : '!bg-white text-black'
  }
}, { immediate: true })
</script>