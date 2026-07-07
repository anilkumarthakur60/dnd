<script lang="ts">
  import { draggable } from '@anil-labs/dnd-svelte'
  import TreeNode from './TreeNode.svelte'

  export interface TreeItem {
    id: number
    label: string
    children: TreeItem[]
  }

  let {
    items,
    onItemsChange,
  }: {
    items: TreeItem[]
    onItemsChange: (items: TreeItem[]) => void
  } = $props()
</script>

<ul
  class="tree-list"
  use:draggable={{
    items,
    onItemsChange,
    group: 'tree',
    animation: 200,
    emptyInsertThreshold: 14,
  }}
>
  {#each items as item, i (item.id)}
    <li data-dnd-index={i} class="dnd-item">
      <div class="tree-node">
        <div class="tree-row">
          <span class="grip">⠿</span>
          <span class="tree-label">{item.label}</span>
        </div>
        {#if item.label.endsWith('/')}
          <TreeNode items={item.children} onItemsChange={(v) => (item.children = v)} />
        {/if}
      </div>
    </li>
  {/each}
</ul>
