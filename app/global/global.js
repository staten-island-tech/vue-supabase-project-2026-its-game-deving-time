import { ref } from "vue"

export const status = ref('N')

export const darkMode = ref(false)

export async function downloadPreferences(supabase, user){
    const {data, error} = await supabase.from("Preferences").select("darkMode").eq("uuid", user.value?.sub)
    if (error){
        throw error
    } else if (data.length === 0){
        defaultPreferences(supabase, user)
    } else{
        darkMode.value = data[0].darkMode
    }
}

async function defaultPreferences(supabase, user){
    const {error} = await supabase.from("Preferences").upsert({uuid: user.value?.sub, darkMode: false}, {onConflict:"uuid"})
        if (error){
            throw error
        }
}