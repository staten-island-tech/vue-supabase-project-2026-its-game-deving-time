<template>
    <div class = "flex flex-col justify-center">
        <h3 class = "text-blue-600"><b>This is the login page</b></h3>
        <p v-for="players in data">{{players}}</p>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()

const {data, error} = await supabase.from(`Players`).select('*')
if (error) throw error;
console.log(data)

</script>

<style scoped>
</style>