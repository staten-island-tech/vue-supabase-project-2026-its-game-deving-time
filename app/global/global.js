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

export async function saveScore(supabase, user, points){
    let bestScore = 0
    const {data, error} = await supabase.from("Leaderboard").select("Highest").eq("uuid", user.value?.sub)
    if (error) throw error

    if (!(data.length === 0)){
        bestScore = data[0].Highest
    }

    if (points > bestScore){
        const {error} = await supabase.from("Leaderboard").upsert({uuid: user.value?.sub, Highest: Math.round(points)}, {onConflict:"uuid"})
        console.log("congrats idiot")
        console.log(error)
    }




}

async function defaultPreferences(supabase, user){
    const {error} = await supabase.from("Preferences").upsert({uuid: user.value?.sub, darkMode: false}, {onConflict:"uuid"})
        if (error){
            throw error
        }
}