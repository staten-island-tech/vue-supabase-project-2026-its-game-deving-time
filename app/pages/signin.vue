<template>
    <div class = "flex flex-col justify-center items-center w-full h-screen bg-amber-500 p-5">
        <fieldset class="h-70 fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            <h1 class = "justify-self-center text-lg"><b>Create an Account</b></h1>
            <label class="label">Username</label>
            <input type="text" class="input" placeholder="Username" v-model="username"/>

            <label class="label">Password</label>
            <input type="password" class="input" placeholder="Password" v-model="password"/>

            <button class="btn btn-neutral mt-4" @click = "signUp">Create Account</button>
        </fieldset>
        <dialog id="errorModal" class="modal">
        <div class="modal-box">
            <h3 class="text-lg text-center font-bold">{{errorMessageTitle}}</h3>
            <p class="py-4">{{errorMessage}}</p>
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
//supabase
const supabase = useSupabaseClient()
const username = ref('')
const password = ref('')
//error
let errorMessageTitle = ref("")
let errorMessage = ref("")
//code
async function signUp() {
    const fakeEmail = username.value + "@gmail.com"

    if (!(isUsernameValid(username.value) && isPasswordValid(password.value))){
        console.log("getTF out")
    } else{
        const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password.value
        })
        if (authError) throw authError
        if (!authData.user) throw new Error('No user returned from signup')

        const { error: playerError } = await supabase.from('Players').insert({
            uuid: authData.user.id,
            Username: username.value
        } as any)
        if (playerError) throw playerError

        await navigateTo('/test')
    }
}
function isUsernameValid(username: String){
    if (username.split(" ").length > 1){
        errorMessageTitle.value = "Invalid Username"
        errorMessage.value = "Usernames should not contain spaces.";
        (document.getElementById('errorModal') as HTMLDialogElement).showModal()
        return false
    } else if(!username){
        errorMessageTitle.value = "Invalid Username"
        errorMessage.value = "You can not have a blank username...";
        (document.getElementById('errorModal') as HTMLDialogElement).showModal()  
        return false
    }
    return true

}
function isPasswordValid(password: String){
    if (password.length < 8){
        errorMessageTitle.value = "Invalid Password"
        errorMessage.value = "Passwords should be more than 8 characters long.";
        (document.getElementById('errorModal') as HTMLDialogElement).showModal()
        return false
    } else if (password.includes(" ")){
        errorMessageTitle.value = "Invalid Password"
        errorMessage.value = "Passwords should not contain spaces.";
        (document.getElementById('errorModal') as HTMLDialogElement).showModal()
        return false
    }
    return true
}

</script>

<style scoped>
</style>
