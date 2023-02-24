# Vue 3.0 HTML Element Size Watcher

A TypeScript class dependent on Vue 3.0 that gives reactivity to DOM elements in a simplistic manner. It provides the size of a ref of any element reactively with minimal performance impact.

## Usage Examples

Displaying a container's width and height:

```
<template>
  <div ref="container">
    <p>Width: {{ sizeWatcher.width?.value }}</p>
    <p>Height: {{ sizeWatcher.height?.value }}</p>
  </div>
</template>

<script setup lang="ts">
  import { SizeWatcher } from ...
  import { ref, type Ref, onMounted } from 'vue';
  
  // The container div will get injected into this ref:
  const container: Ref<HTMLElement | null> = ref(null)
  
  // Parameters:
  // 1. The element to watch the size of
  // 2. Whether or not to watch the element's width
  // 3. Whether or not to watch the element's height
  //
  // In this case, we want to know both the element's width & height, so true is passed for both.
  const sizeWatcher: SizeWatcher = new SizeWatcher(container, true, true)
  
  // Calling .start() triggers the sizeWatcher to begin watching the element.
  // This should be done at some point after the element is mounted.
  onMounted(() => sizeWatcher.start())
</script>
```



Watching only the width (and passing to a child component for an svg):

Parent component:
```
<template>
  <div>
    <img ref="image" src="..."/>
    <child :image-size="imageSize"/>
  </div>
</template>

<script setup lang="ts">
  import { SizeWatcher } from ...
  import { ref, type Ref, onMounted, nextTick } from 'vue';
  
  const image: Ref<HTMLElement | null> = ref(null)
  
  // The third parameter (the one for height) is false this time (since we only need to watch for width in this scenario).
  const imageSize: SizeWatcher = new SizeWatcher(image, true, false)
  
  onMounted(() => imageSize.start())
</script>
```

Child component:
```
<template>
  <svg>
    <rect fill="red" :width="imageSize.width?.value"/>
  </svg>
</template>

<script setup lang="ts">
  import { SizeWatcher } from ...
  
  const props = defineProps({
    imageSize: SizeWatcher
  })
</script>
```

## Notes

- Both margins <ins>and padding</ins> are **not** included in the element's size.

- If the element's size fails to load (or the size is not being watched), 0 will be returned. This helps to avoid null or undefined exceptions.

- To keep the performance impact to a minimum, internally, the SizeWatcher uses `setTimeout()` to check the element's size once every 200 milliseconds. This is a significant optimization over directly listening to a resize event. However, there is one small negativity involved: If the browser window were to be resized by clicking and dragging the edge of the window, there could be some jittery behavior (depending on how the element's size is used). But even in that situation, resource usage by the SizeWatcher should be minimal.
