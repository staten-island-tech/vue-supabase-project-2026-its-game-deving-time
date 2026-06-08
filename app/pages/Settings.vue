<template>
<div class = "flex flex-col items-center p-10 overflow-y">
    <div class="card w-200 shadow-sm">
        <div class="flex flex-row card-body">
            <div class = "flex flex-col w-[70%] justify-center items-center">
                <h2 class="card-title">Dark Mode</h2>
                <p>Make everything extremely dark and scary. Not for people who are afraid of the dark.</p>
            </div>
            <div class = "flex items-center justify-center w-[30%]">
                <input type="checkbox" :checked = "preferences.wantDarkMode" @change = "toggleDark" class="bg-white! toggle toggle-neutral" />
            </div>

        </div>
    </div>
</div>

</template>

<script lang = "ts" setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

import { darkMode, toggleDark } from '~/global/global';

const preferences = reactive({
    wantDarkMode: darkMode.value,
})

async function updatePreferences(){
    const {data, error} = await supabase.from("Preferences")
}


</script>

<style scoped>

</style>