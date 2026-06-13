<template>
    <div class="navbar shadow-sm">
        <div class="flex-1">
            <button class="btn btn-ghost text-xl hover:text-blue-600" @click = "display = 'Dashboard'">Dashboard</button>
        </div>
        <div class="flex gap-2">
            <div class =  "flex items-center">
                <p>{{ username }}</p>
            </div>
            <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                <img
                    alt="Tailwind CSS Navbar component"
                    :src="image" />
                </div>
            </div>
            <ul
                tabindex="-1"
                class="menu menu-sm dropdown-content rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li>
                <a class="justify-between hover:underline" @click = "display = 'Profile'">
                    Profile
                </a>
                </li>
                <li><a class = "hover:underline" @click = "display = 'Settings'">Settings</a></li>
                <li><button class = "hover:underline" @click = "Logout">Logout</button></li>
            </ul>
            </div>
        </div>
    </div>
    <Profile v-if ='display === "Profile"'></Profile>
    <Settings v-if = "display === 'Settings'"></Settings>
    <Others v-if = "display === 'Dashboard'"></Others>

</template>
<script lang = "ts" setup>
definePageMeta({
  middleware: 'auth' as any
})

import { darkMode } from '~/global/global.js'
import Profile from './Profile.vue'
import Settings from './Settings.vue'
import { useAuthStore } from '~/store/auth'
import Others from './Others.vue'
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const authStore = useAuthStore()
const image = ref(authStore.avatar)
const username = computed(() => {
  return user.value?.email?.split("@gmail.com")[0] ?? ''
})

image.value = "/placeholder.jpg"

watch(() => authStore.avatar, (newAvatar) => {
    image.value = newAvatar
})

const display = ref('Dashboard')

async function Logout(){
    await supabase.auth.signOut()
    darkMode.value = false
    await navigateTo('/')
}

watch(user, async (newUser) => {
    if (!newUser) return
    
    const { data: player } = await supabase.from('Players')
        .select('avatar')
        .eq('uuid', (newUser as any).sub)
        .single() as any

    if ((player as any)?.avatar) {
        image.value = (player as any).avatar
    }
}, { immediate: true })

</script>