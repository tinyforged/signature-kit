<template>
  <div id="app">
    <header class="header">
      <div class="header-inner">
        <h1>Signature Kit</h1>
        <span class="badge">Vue Playground</span>
      </div>
    </header>
    <SignatureDemo />
  </div>
</template>

<script setup lang="ts">
import SignatureDemo from './components/SignatureDemo.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f0f2f5;
  color: #1a1a2e;
  margin: 0;
}

#app {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}

.header {
  flex-shrink: 0;
  padding-bottom: 1rem;
}

.header-inner {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #e8f0fe;
  color: #1a73e8;
  letter-spacing: 0.02em;
}
</style>
