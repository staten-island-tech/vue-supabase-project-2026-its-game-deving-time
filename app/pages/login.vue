<template>
    <div class = "flex justify-center items-center w-full h-screen bg-amber-500">
        <fieldset class="h-60 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <label class="label">Username</label>
            <input type="text" class="input" placeholder="Username" v-model="username"/>

            <label class="label">Password</label>
            <input type="password" class="input" placeholder="Password" v-model="password"/>

            <button class="btn btn-neutral mt-4" @click = "login">Login</button>
        </fieldset>
    </div>
</template>

<script setup>
const router = useRouter()

const supabase = useSupabaseClient()
const username = ref('')
const password = ref('')

const {data, error} = await supabase.from(`Players`).select('*')
if (error) throw error;
console.log(data)

async function login(){
    console.log(username.value, password.value)
    const {data, error} = await supabase.from(`Players`).select('*').eq("Username", username.value)
    if (error) throw error;
    
    try{
        if ((data.length > 0) && (data[0].Password === password.value)){
            await navigateTo('/test')
        }
    }catch (err){
        console.log(err)
    }
   
}


</script>

<style scoped>
</style>