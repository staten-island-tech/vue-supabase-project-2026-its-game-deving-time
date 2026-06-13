<template>
<div class = "flex flex-row justify-center p-6">
  <div class="flex justify-center p-6">
    <div class="card w-100 shadow-sm">
      <p class="text-lg text-center"><b>Leaderboard</b></p>
      <ul class="h-75 list rounded-box shadow-md overflow-y-auto">
        <li v-for="(row, index) in leaderboard" class="flex justify-start list-row w-full">
          <div class="text-4xl font-thin opacity-30 tabular-nums w-[5%]">{{ Number(index) + 1 }}</div>
          <div class="w-[10%] avatar">
            <img class="size-10 rounded-box" :src="row.avatar"/>
          </div>
          <div class="flex-1 text-xl items-center font-bold">{{ row.username}}</div>
          <div class="flex text-xl items-center">{{ row.Highest }}</div>
        </li>
      </ul>
    </div>
  </div>
  <div class="flex flex-col justify-center items-center w-80 h-75">
    <button class="h-50 overflow-hidden hover:cursor-pointer" @click = "gameTime">
      <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWkzaXd3c3FlcjRtZnkybnA5dHVlMnJ6Mnc5MG5pZWs2cTdkeXpzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/atLkXCLfT1dza/giphy.gif" 
      class="w-full h-full object-cover" />
    </button>
    <p class = "text-lg"><b>Ready?</b></p>
    <p class = "text-lg">Click the portal to start!</p>
  </div>
</div>
</template>

<script lang = "ts" setup>
const supabase = useSupabaseClient()
const leaderboard: any = ref([])
const user = useSupabaseUser()

console.log(user.value)

async function retrieveLeaderboard() {
  const { data: scores, error: scoresError } = await supabase
    .from('Leaderboard')
    .select('uuid, Highest')
    .order('Highest', { ascending: false })

  const { data: players, error: playersError } = await supabase
    .from('Players')
    .select('uuid, Username, avatar') as any

  if (scoresError || playersError) {
    return
  }

  leaderboard.value = scores.map((score: any) => ({
    Highest: score.Highest,
    username: players.find((p: any) => p.uuid === score.uuid)?.Username ?? 'Unknown',
    avatar: players.find((p: any) => p.uuid === score.uuid)?.avatar ?? "/placeholder.jpg"
  }))
}

async function gameTime(){
  await nextTick()
  await navigateTo('/game')
}

retrieveLeaderboard()

</script>

<style scoped>

</style>