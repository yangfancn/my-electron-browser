<template>
  <div class="error-page">
    <h1>{{ errorDescription }}</h1>
    <button @click="reload">重新加载</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  errorCode: number
  errorDescription: string
}>()

const reload = (): void => window.api.activeTabReload()
</script>

<style scoped>
.error-page {
  background-color: #eaf1fd;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h1 {
    color: #99999a;
    font-size: 20px;
    margin-bottom: 20px;
  }

  button {
    border: 1px solid rgba(22, 34, 91, 0.8);
    padding: 0.35rem 1rem;
    border-radius: 5px;
    background-color: transparent;
    color: rgba(22, 34, 91, 1);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(22, 34, 91, 0.8);
      color: #fff;
    }
  }
}
</style>
