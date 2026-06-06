import { ref } from "vue"

export const status = ref('N')

export const darkMode = ref(false)

export function toggleDark(){
    darkMode.value = !darkMode.value
    console.log(darkMode.value)
}