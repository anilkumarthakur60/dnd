<script setup lang="ts">
import { ref } from 'vue'
import NestedNode from './NestedNode.vue'
import { Draggable } from '../../lib'
import { makeReset } from '../composables/useReset'

export interface Node {
  id: number
  label: string
  children: Node[]
}

const tree = ref<Node[]>([
  {
    id: 1,
    label: '🏢 Engineering',
    children: [
      {
        id: 11,
        label: '⚙️ Platform',
        children: [
          {
            id: 111,
            label: '🔐 Auth',
            children: [
              {
                id: 1111,
                label: 'OAuth 2.0',
                children: [
                  { id: 11111, label: 'Token rotation', children: [] },
                  { id: 11112, label: 'PKCE flow', children: [] },
                  { id: 11113, label: 'Refresh strategy', children: [] },
                ],
              },
              {
                id: 1112,
                label: 'SAML SSO',
                children: [
                  { id: 11121, label: 'Okta integration', children: [] },
                  { id: 11122, label: 'JIT provisioning', children: [] },
                ],
              },
              {
                id: 1113,
                label: 'Passkeys',
                children: [{ id: 11131, label: 'WebAuthn support', children: [] }],
              },
            ],
          },
          {
            id: 112,
            label: '🚀 Infrastructure',
            children: [
              {
                id: 1121,
                label: 'Kubernetes',
                children: [
                  { id: 11211, label: 'Autoscaler', children: [] },
                  { id: 11212, label: 'Ingress controller', children: [] },
                  { id: 11213, label: 'Network policies', children: [] },
                ],
              },
              {
                id: 1122,
                label: 'Observability',
                children: [
                  { id: 11221, label: 'OpenTelemetry traces', children: [] },
                  { id: 11222, label: 'Loki log pipeline', children: [] },
                ],
              },
              {
                id: 1123,
                label: 'CI / CD',
                children: [{ id: 11231, label: 'Canary deploy', children: [] }],
              },
            ],
          },
          {
            id: 113,
            label: '🗄️ Data',
            children: [
              {
                id: 1131,
                label: 'Postgres',
                children: [
                  { id: 11311, label: 'Read replicas', children: [] },
                  { id: 11312, label: 'Logical replication', children: [] },
                ],
              },
              {
                id: 1132,
                label: 'Streaming',
                children: [{ id: 11321, label: 'Kafka topics', children: [] }],
              },
            ],
          },
        ],
      },
      {
        id: 12,
        label: '🎨 Product',
        children: [
          {
            id: 121,
            label: 'Web',
            children: [
              {
                id: 1211,
                label: 'Vue',
                children: [
                  { id: 12111, label: 'Composition API patterns', children: [] },
                  { id: 12112, label: 'Pinia store split', children: [] },
                ],
              },
              {
                id: 1212,
                label: 'Design system',
                children: [
                  { id: 12121, label: 'Token pipeline', children: [] },
                  { id: 12122, label: 'Storybook coverage', children: [] },
                ],
              },
            ],
          },
          {
            id: 122,
            label: 'Mobile',
            children: [
              {
                id: 1221,
                label: 'iOS',
                children: [{ id: 12211, label: 'SwiftUI migration', children: [] }],
              },
              {
                id: 1222,
                label: 'Android',
                children: [{ id: 12221, label: 'Jetpack Compose', children: [] }],
              },
            ],
          },
        ],
      },
      {
        id: 13,
        label: '🤖 ML',
        children: [
          {
            id: 131,
            label: 'Search',
            children: [
              {
                id: 1311,
                label: 'Ranking',
                children: [
                  { id: 13111, label: 'Feature store', children: [] },
                  { id: 13112, label: 'AB test harness', children: [] },
                ],
              },
            ],
          },
          {
            id: 132,
            label: 'Personalization',
            children: [
              {
                id: 1321,
                label: 'Embeddings',
                children: [{ id: 13211, label: 'Vector DB sync', children: [] }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: '💼 Operations',
    children: [
      {
        id: 21,
        label: 'Customer success',
        children: [
          {
            id: 211,
            label: 'Enterprise',
            children: [
              {
                id: 2111,
                label: 'Onboarding',
                children: [
                  { id: 21111, label: 'Runbook v3', children: [] },
                  { id: 21112, label: 'Kickoff template', children: [] },
                ],
              },
            ],
          },
          {
            id: 212,
            label: 'Self-serve',
            children: [
              {
                id: 2121,
                label: 'In-app guides',
                children: [{ id: 21211, label: 'Tour engine', children: [] }],
              },
            ],
          },
        ],
      },
      {
        id: 22,
        label: 'Finance',
        children: [
          {
            id: 221,
            label: 'Billing',
            children: [
              {
                id: 2211,
                label: 'Invoicing',
                children: [
                  { id: 22111, label: 'Tax compliance', children: [] },
                  { id: 22112, label: 'PDF rendering', children: [] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: '📣 Marketing',
    children: [
      {
        id: 31,
        label: 'Growth',
        children: [
          {
            id: 311,
            label: 'Acquisition',
            children: [
              {
                id: 3111,
                label: 'Paid',
                children: [
                  { id: 31111, label: 'Search ads', children: [] },
                  { id: 31112, label: 'Display network', children: [] },
                ],
              },
              {
                id: 3112,
                label: 'Organic',
                children: [{ id: 31121, label: 'SEO content calendar', children: [] }],
              },
            ],
          },
        ],
      },
      {
        id: 32,
        label: 'Brand',
        children: [
          {
            id: 321,
            label: 'Comms',
            children: [
              {
                id: 3211,
                label: 'PR',
                children: [{ id: 32111, label: 'Launch press kit', children: [] }],
              },
            ],
          },
        ],
      },
    ],
  },
])

function expandAll() {
  // No collapse state in this demo — placeholder to demonstrate depth visually.
  alert('Tip: drag any node into any branch — items move freely across all 5 levels.')
}

const reset = makeReset(tree)
</script>

<template>
  <p class="demo-desc">
    Recursive tree, <strong>5 levels deep</strong>. Drop one node <em>on top of another</em> to make it a child of that node;
    drop in the gap between siblings to reorder at the same level. Nodes can't be dropped into their own subtree.
    <a href="#" @click.prevent="expandAll" style="color: var(--accent)">How to use →</a>
  </p>
  <div class="demo-toolbar">
    <button class="btn reset" @click="reset">↺ Reset</button>
  </div>
  <div class="demo-card">
    <Draggable
      v-model="tree"
      group="tree"
      item-key="id"
      :animation="200"
      :empty-insert-threshold="20"
      class="nested-root"
    >
      <template #item="{ element }">
        <NestedNode :node="element" />
      </template>
    </Draggable>
  </div>
</template>

<style scoped>
.nested-root {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
