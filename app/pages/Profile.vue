<template>
    <div class="flex justify-center align-middle pt-10 p-2">
        <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
            <img class="w-50" :src="preview ?? image" alt="pfp" />
        </figure>
        <div class="items-center card-body">
            <h2 class="card-title">Profile Picture</h2>
            <p>Upload a profile picture here below.</p>
            <div class="card-actions justify-end">
               <input type="file" ref="fileInput" class="hidden" @change="handleFile"/>
               <button class="btn btn-neutral" @click="(fileInput as any).click()">Choose Image</button>
               <button class="btn btn-primary" @click="uploadAvatar" :disabled="!selectedFile">Save</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/store/auth'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const image = ref('/placeholder.jpg')
const preview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref(null)

const authStore = useAuthStore()

watch(user, async (newUser) => {
    if (!newUser) return
    const { data: player, error } = await supabase.from('Players')
        .select('avatar')
        .eq('uuid', newUser.sub)
        .single() as any

    if ((player as any)?.avatar) image.value = (player as any).avatar
}, { immediate: true })

function handleFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    selectedFile.value = file
    preview.value = URL.createObjectURL(file)
}

async function uploadAvatar() {
    if (!selectedFile.value || !user.value) return

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${(user.value as any).sub}/avatar`, selectedFile.value, { upsert: true })

    if (uploadError) return console.error(uploadError)

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${(user.value as any).sub}/avatar`)

    const bustCache = `${data.publicUrl}?t=${Date.now()}`

    await (supabase.from('Players') as any)
        .update({ avatar: bustCache })
        .eq('uuid', (user.value as any).sub)

    authStore.setAvatar(bustCache)
    image.value = bustCache
    preview.value = null
    selectedFile.value = null
}


</script>