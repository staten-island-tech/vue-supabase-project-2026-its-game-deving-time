<template>
    <div class = "flex justify-center">
      <h3 class = "text-blue-600"><b>Project Name</b></h3>
        <div>

        </div>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient()

const {data, error} = await supabase.from(`players`).select('*').eq('id', playerId).single()
if (error) throw error;
console.log(data)

</script>

<style scoped>
</style>