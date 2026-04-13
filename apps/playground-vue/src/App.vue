<template>
  <div class="max-w-240 mx-auto p-6">
    <div class="shrink-0 pb-4">
      <div class="flex items-baseline gap-3">
        <h1 class="text-2xl font-bold tracking-tight">Signature Kit</h1>
        <span class="inline-block text-[0.7rem] font-semibold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] tracking-wide">Vue Playground</span>
      </div>
    </div>
    <SignatureDemo />
  </div>
</template>

<script setup lang="ts">
import SignatureDemo from './components/SignatureDemo.vue'
</script>
