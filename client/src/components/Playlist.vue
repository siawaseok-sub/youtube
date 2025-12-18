<template>
  <section v-if="error" class="error-message" style="color: var(--text-primary);">
    プレイリストの取得に失敗しました。
  </section>

  <section v-else-if="playlist" class="playlist-section" :class="`type-${displayType}`">
    <template v-if="displayType !== 'channel'">
      <h2 class="playlist-title" style="color: var(--text-primary);">
        {{ playlist.title }}
      </h2>
      <p class="playlist-meta" style="color: var(--text-primary);">
        動画本数: {{ playlist.totalItems }}
        <span
          class="views"
          v-if="displayType !== 'watch' && playlist.views"
        >
          ｜ {{ playlist.views }}
        </span>
      </p>
    </template>

    <div
      ref="scrollContainer"
      class="playlist-items-scroll"
      :class="`scroll-${displayType}`"
    >
      <div
        v-for="(item, idx) in playlist.items"
        :key="item.videoId || idx"
        class="playlist-item"
        :class="{ active: item.videoId === playVideoId }"
        :data-video-id="item.videoId"
      >
        <router-link
          :to="displayType !== 'channel'
            ? `/watch?v=${item.videoId}&list=${playlist.playlistId}`
            : `/watch?v=${item.videoId}`"
          class="video-link"
        >
          <!-- watch レイアウト -->
          <div v-if="displayType === 'watch'" class="watch-layout">
            <div class="thumbnail-wrapper small-thumb">
              <img
                :src="item.thumbnail || getPrimaryThumbnail(item.videoId)"
                class="thumbnail"
                @error="onImageError($event, item.videoId)"
              />
              <span class="duration" v-if="item.duration">
                {{ item.duration }}
              </span>
            </div>

            <div class="text-content">
              <p class="title">{{ item.title }}</p>
              <p class="author">{{ item.author }}</p>

              <p class="meta-info" v-if="item.views || item.published">
                <span v-if="item.views">
                  <template v-if="isNumericOnly(item.views)">
                    {{ item.views }}人が待機中
                  </template>
                  <template v-else>
                    {{ item.views }}
                  </template>
                </span>
                <span v-if="item.views && item.published"> • </span>
                <span v-if="item.published">{{ item.published }}</span>
              </p>
            </div>
          </div>

          <!-- 通常レイアウト -->
          <div v-else>
            <div class="thumbnail-wrapper">
              <img
                :src="item.thumbnail || getPrimaryThumbnail(item.videoId)"
                class="thumbnail"
                @error="onImageError($event, item.videoId)"
              />
              <span class="duration" v-if="item.duration">
                {{ item.duration }}
              </span>
            </div>

            <p class="title">{{ item.title }}</p>
            <p class="author">{{ item.author }}</p>

            <p class="meta-info" v-if="item.views || item.published">
              <span v-if="item.views">
                <template v-if="isNumericOnly(item.views)">
                  {{ item.views }}人が待機中
                </template>
                <template v-else>
                  {{ item.views }}
                </template>
              </span>
              <span v-if="item.views && item.published"> • </span>
              <span v-if="item.published">{{ item.published }}</span>
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </section>

  <section v-else>
    <p style="color: var(--text-primary);">プレイリストを読み込み中...</p>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { apiRequest } from "@/services/requestManager";

const props = defineProps({
  playlistId: String,
  playVideoId: String,
  displayType: {
    type: String,
    default: "default",
  },
});

const route = useRoute();

const playlist = ref(null);
const loading = ref(false);
const error = ref(false);
const scrollContainer = ref(null);

const playlistId = computed(() => props.playlistId || route.query.list || "");
const playVideoId = computed(() => props.playVideoId || route.query.play || route.query.v || "");
const displayType = computed(() => props.displayType || route.query.type || "default");

function isNumericOnly(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return /^[0-9]+$/.test(value);
}

onMounted(async () => {
  if (!playlistId.value) {
    console.error("playlistId が指定されていません");
    error.value = true;
    return;
  }

  loading.value = true;

  try {
    const raw = route.query.v ? `playlist=${playlistId.value}==p==v==i==${route.query.v}` : `playlist=${playlistId.value}`;
    const data = await apiRequest({
      params: { __rawQuery: raw },
      retries: 1,
      timeout: 30000,
      jsonpFallback: true,
    });

    playlist.value = data;

    await nextTick();
    if (playVideoId.value && scrollContainer.value) {
      const target = scrollContainer.value.querySelector(
        `.playlist-item[data-video-id="${playVideoId.value}"]`
      );
      if (target) {
        scrollContainer.value.scrollTo({
          top:
            target.offsetTop -
            scrollContainer.value.clientHeight / 2 +
            target.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }
  } catch (err) {
    console.error("プレイリスト取得失敗:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

function getPrimaryThumbnail(id) {
  return `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
}

function onImageError(event, id) {
  if (!event.target.dataset.error) {
    event.target.src = `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
    event.target.dataset.error = "true";
  }
}
</script>

<style scoped>
.playlist-item.active {
  background-color: var(--hover-bg);
  transition: background-color 0.2s ease;
}

.playlist-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.type-watch {
  background-color: transparent;
  border: 1px solid var(--border-color); 
  border-radius: 8px;
  padding: 0.9rem;
  max-width: 360px;
}

.playlist-title {
  font-size: 1.4rem;
  margin-bottom: 0.2rem;
  margin-block-start:0.3em;
  color: var(--text-primary);
}

.playlist-meta {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.scroll-default,
.scroll-channel {
  display: grid;
  grid-template-columns: repeat(auto-fill, 210px);
  justify-content: center;
  gap: 12px;
  padding-bottom: 1rem;
}

.scroll-watch {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 420px;
  padding-right: 6px;
}

.playlist-item {
  width: 210px;
  flex-shrink: 0;
}

.type-watch .playlist-item {
  width: 100%;
}

.video-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 0.5rem;
  margin-block: 10px;
  background-color: var(--bg-secondary);
}

.thumbnail-wrapper.small-thumb {
  width: 160px;
  aspect-ratio: 16 / 9;
  flex-shrink: 0;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 0.75rem;
  color: var(--on-accent);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2px 5px;
  border-radius: 4px;
}

.title {
  margin-block-end: 3px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  margin-top: 1;
  line-height: 1.3;
  max-height: calc(1.3em * 2); 
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
  margin-left: 2px;
  color: var(--text-primary);
}

.author {
  margin-block-start: 3px;
  margin-block-end: 3px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 2px;
}

.meta-info {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 2px;
  margin-top: 2px;
}

.watch-layout {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
}

@media (max-width: 600px) {
  .playlist-item {
    width: 100%;
  }
}

.error-message {
  color: var(--accent-weak);
  padding: 1rem;
  text-align: center;
}
</style>