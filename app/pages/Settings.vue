<template>
<div class = "flex flex-col items-center p-10 overflow-y">
    <div class="card w-200 shadow-sm">
        <div class="flex flex-row card-body">
            <div class = "flex flex-col w-[70%] justify-center items-center">
                <h2 class="card-title">Dark Mode</h2>
                <p>Make everything extremely dark and scary. Not for people who are afraid of the dark.</p>
            </div>
            <div class = "flex items-center justify-center w-[30%]">
                <input type="checkbox" :checked = "darkMode" @change = "() => {toggleDark(); savePreferences()}" class="bg-white! toggle toggle-neutral" />
            </div>

        </div>
    </div>
</div>

</template>

<script lang = "ts" setup>
import { darkMode} from '~/global/global';
const supabase = useSupabaseClient()
const user = useSupabaseUser()

function toggleDark(){
    darkMode.value = !darkMode.value
}
async function savePreferences(){
    if (!user.value) return
    console.log(user.value)

    const {error} = await supabase.from("Preferences").upsert({uuid: user.value.sub, darkMode: darkMode.value} as any, {onConflict:"uuid"})
    if (error){
        throw error
    }
}


</script>

<style scoped>

</style>