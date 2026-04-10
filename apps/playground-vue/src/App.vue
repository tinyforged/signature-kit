<template>
  <div id="app">
    <h1>Signature Kit - Vue Playground</h1>
    <SignatureDemo />
  </div>
</template>

<script setup lang="ts">
import SignatureDemo from './components/SignatureDemo.vue'
</script>

<style>
body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
  background: #f5f5f5;
  margin: 0;
}
#app {
  max-width: 900px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 1.5rem;
}
</style>
