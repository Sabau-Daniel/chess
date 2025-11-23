<template>
  <div class="wrapper">
    <button @click="pressESP">Press ESP</button>
  </div>
</template>

<script setup lang="ts">
import api from "./api/apiCall";

const pressESP = async () => {
  let error: any = null;
  const response = await api("GET", "/btn-pressed", null).catch(
    (err) => (error = err)
  );
  console.log("response", response);
  if (error || !response) {
    console.error(error ? error : "Internal error. Please try again later.");
    return null;
  }
  return response;
};
</script>

<style>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
