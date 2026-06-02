<template>
    <div class="flex justify-center align-middle p-10">
        <div class="card bg-base-100 w-96 shadow-sm">
        <figure>
            <img class="w-50" :src="image" alt="pfp" />
        </figure>
        <div class="items-center card-body">
            <h2 class="card-title">Profile Picture</h2>
            <p>Upload a profile picture here below.</p>
            <div class="card-actions justify-end">
                <input type="file" id="fileInput" class="hidden" @change="handleFile"/>
                <button class="btn btn-neutral" @click="document.getElementById('fileInput').click()">Change Avatar</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    username: String
})
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const image = ref('/placeholder.jpg')
console.log(user.value!)

// Load existing avatar on mount
const { data: player} = await supabase.from('Players')
    .select('avatar')
    .eq('uuid', user.value!.sub)
    .single() as any

    if ((player as any)?.avatar){
        image.value = (player as any).avatar
    }

async function handleFile(event: Event) {
    console.log("triggered")
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    console.log("trigger2.0")
    // Show preview
    image.value = URL.createObjectURL(file)

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.value!.sub}/avatar`, file, { upsert: true })

    if (uploadError) return console.error(uploadError)

    const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.value!.sub}/avatar`)

    await (supabase.from('Players') as any)
        .update({ avatar: data.publicUrl } as any)
        .eq('uuid', user.value!.sub)
    null
}
</script>