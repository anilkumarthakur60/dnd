<script setup lang="ts">
import { ref } from 'vue'
import NestedNode from './NestedNode.vue'

export interface Node {
  id: number
  label: string
  children: Node[]
}

const tree = ref<Node[]>([
  {
    id: 1,
    label: 'Frontend',
    children: [
      { id: 11, label: 'Vue', children: [] },
      { id: 12, label: 'React', children: [{ id: 121, label: 'Next.js', children: [] }] },
      { id: 13, label: 'Svelte', children: [] },
    ],
  },
  {
    id: 2,
    label: 'Backend',
    children: [
      { id: 21, label: 'Go', children: [] },
      { id: 22, label: 'Rust', children: [] },
    ],
  },
  {
    id: 3,
    label: 'Infra',
    children: [
      { id: 31, label: 'Kubernetes', children: [] },
      { id: 32, label: 'Terraform', children: [] },
    ],
  },
])
</script>

<template>
  <p class="demo-desc">
    Recursive nested lists. Each node is a draggable that shares group "tree" with every other node — drag categories or sub-items at any depth, into any branch.
  </p>
  <div class="demo-card">
    <NestedNode :items="tree" />
  </div>
</template>
