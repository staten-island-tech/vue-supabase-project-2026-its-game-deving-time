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
  <div class="flex flex-col justify-center items-center w-80 h-75">
    <button class="h-50 overflow-hidden hover:cursor-pointer" onclick="tutorial.showModal()">
      <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm5pczkzem16MTQ1MzNlb25ha3NyNGVtdXNyaXh3cWd6d3N6NXlzaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BxUPmtcDtOe1jtKwYi/giphy.gif" 
      class="w-full h-full object-cover" />
    </button>
    <p class = "text-lg"><b>Tutorial</b></p>
    <p class = "text-lg">Learn the game!</p>
  </div>

  <dialog id="tutorial" class="modal">
    <div class="flex flex-col modal-box overflow-y-scroll h-100">
      <p class="text-lg text-center font-bold">Welcome to Red Ball x Slope</p>
      <p class="py-2 text-center">Clicking the portal will grant you access to the game.</p>
      <p class="text-lg text-center font-bold">Objective</p>
      <p class="py-2 text-center">Each second, you earn 1 point for being alive. You earn bonus points the faster you are.</p>
      <p class="py-2 text-center">Your goal is to get the highest score and climb the leaderboard. Only your all time high score will be saved.</p>
      <p class="text-lg text-center font-bold">Movement</p>
      <p class="py-2 text-center">Use WASD to move, space to jump.</p>
      <p class="py-2 text-center">The camera moves automatically based on WASD.</p>
      <p class="text-lg text-center font-bold">Generation</p>
      <p class="py-2 text-center">The game is procedurally generated. When you reach the end of the current section, the next section will generate.</p>
      <p class="py-2 text-center">Each section has a timer. When the timer runs out, the section will turn red and disappear. Falling into the void means instant death.</p>
      <p class="text-lg text-center font-bold">Enemies</p>
      <p class="py-2 text-center">When you begin the game, enemies will spawn after a time limit. They will follow the player. If they touch you, you lose one health. Losing 3 HP means death. Your HP is represented by how red the player is.</p>
      <p class="py-2 text-center">When new terrain generates, new enemies will also spawn.</p>
      <p class="text-lg text-center font-bold">Good luck!</p>
      <div class="modal-action justify-center">
        <form method="dialog">
          <button class="btn">I understand!</button>
        </form>
      </div>
    </div>
  </dialog>
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