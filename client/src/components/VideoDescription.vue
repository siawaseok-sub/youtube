<template>
  <div class="video-description" ref="descTop">
    <div v-if="!localShowFull" class="description-preview">
      <p v-if="descriptionRun0">{{ descriptionRun0 }}</p>
      <p v-if="descriptionRun1">{{ descriptionRun1 }}</p>
    </div>

    <div
      v-else
      class="description-full"
      v-html="formattedDescription"
    ></div>

    <span
      class="description-toggle"
      role="button"
      tabindex="0"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      {{ localShowFull ? "一部を表示" : "...もっと見る" }}
    </span>
  </div>
</template>

<script>
export default {
  name: "VideoDescription",
  props: {
    descriptionRun0: { type: String, default: "" },
    descriptionRun1: { type: String, default: "" },
    formattedDescription: { type: String, default: "" },
    showFull: { type: Boolean, default: false },
  },
  emits: ["toggle"],
  data() {
    return {
      localShowFull: this.showFull,
    };
  },
  watch: {
    showFull(v) {
      this.localShowFull = v;
    },
  },
  methods: {
    toggle() {
      this.localShowFull = !this.localShowFull;
      this.$emit("toggle", this.localShowFull);

      this.$nextTick(() => {
        // 「一部を表示」に戻したときだけ概要欄の先頭へスクロール
        if (!this.localShowFull) {
          const el = this.$refs.descTop;
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      });
    },
  },
};
</script>

<style scoped>
.video-description {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-top: 12px;
  margin-bottom: 15px;
  white-space: pre-wrap;
  word-break: break-word;
}

.description-preview {
  max-height: 120px;
  overflow: hidden;
  margin: 0 0 0.4em 0;
}

.description-full {
  margin: 0;
}

.description-toggle {
  display: inline-block;
  color: var(--accent-color);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin-top: 4px;
}
</style>