<template>
   <div class="post-meta">
      Published {{ post.date }} |
      <template v-if="post.timeToRead">
        ~ Reading Time: <strong>{{ post.timeToRead }} mins</strong>
      </template>
    </div>
</template>

<script>
export default {
  props: ['post']
}
</script>

<style lang="scss">
.post-meta {
  font-size: .8em;
  opacity: .8;
}
</style>
