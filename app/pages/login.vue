<template>
    <div class = "flex justify-center items-center w-full h-screen bg-amber-500">
        <fieldset class="h-70 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h1 class = "justify-self-center text-lg"><b>Log In</b></h1>
            <label class="label">Username</label>
            <input type="text" class="input" placeholder="Username" v-model="username"/>

            <label class="label">Password</label>
            <input type="password" class="input" placeholder="Password" v-model="password"/>

            <button class="btn btn-neutral mt-4" @click = "login">Login</button>

            <button>Sign up?</button>
        </fieldset>
        <dialog id="errorModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg text-center font-bold">Invalid Loggin Credentials</h3>
            <p class="py-4">Check your password and username. Are you sure you are entering the correct creentials?</p>
            <div class="modal-action">
            <form method="dialog">
                <button class="btn">Exit</button>
            </form>
            </div>
        </div>
        </dialog>
    </div>
</template>

<script lang = "ts" setup>
const supabase = useSupabaseClient()
const username = ref('')
const password = ref('')

async function login(){
    const { data, error } = await supabase.auth.signInWithPassword({
    email: username.value + '@gmail.com',
    password: password.value
    })

    if (error){
        (document.getElementById('errorModal') as HTMLDialogElement).showModal() 
    } else{
        await navigateTo('/test')
    }

}


</script>

<style scoped>
</style>