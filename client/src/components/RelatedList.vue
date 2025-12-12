<template>
  <aside v-if="relatedVideos.length" class="related-section">
    <PlaylistComponent
      v-if="playlistId"
      displayType="watch"
      :playlistId="playlistId"
      :playVideoId="currentVideoId"
    />
    <h3 class="related-title">関連動画</h3>
    <ul class="related-list">
      <li v-for="r in relatedVideos" :key="r.videoId" class="related-item" :data-video-id="r.videoId">
        <router-link v-if="r.videoId" :to="rLink(r)" class="page-link">
          <div class="thumb-wrapper">
            <img :src="r.base64imge" :alt="r.title" class="thumb-img" />
            <span v-if="r.badge" class="duration-badge" :class="{ 'badge-live': r.badge.toLowerCase().includes('ライブ') }">{{ r.badge }}</span>
          </div>
        </router-link>
        <router-link v-if="r.videoId" :to="rLink(r)" class="page-link">
          <div class="video-info">
            <span class="video-title-related" :title="r.title">{{ r.title }}</span>
            <div class="video-metadata">
              <div class="one-line re-actername">{{ r.metadataRow1 }}</div>
              <span v-if="r.metadataRow2Part1 && r.metadataRow2Part1.replace(/\s+/g, '') !== '本日更新'">{{ r.metadataRow2Part1.replace(/\s+/g, '') === '再生リストの全体を見る' ? '再生リスト' : r.metadataRow2Part1.replace(/\s+/g, '') }}</span>
              <span v-if="r.metadataRow2Part2 && r.metadataRow2Part2.replace(/\s+/g, '')" class="dot">・</span>{{ r.metadataRow2Part2 ? r.metadataRow2Part2.replace(/\s+/g, '') : '' }}
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
import PlaylistComponent from '@/components/Playlist.vue';

export default {
  name: 'RelatedList',
  components: { PlaylistComponent },
  props: {
    relatedVideos: { type: Array, default: () => [] },
    playlistId: { type: [String, null], default: null },
    currentVideoId: { type: String, default: '' },
  },
  methods: {
    rLink(r) {
      return r.replaylistId && r.replaylistId.length > 20 ? `/watch?v=${r.videoId}&list=${r.replaylistId}` : `/watch?v=${r.videoId}`;
    },
  },
};
</script>

<style scoped>
.related-section {
  width: 360px;
  flex-shrink: 0;
}

.related-title {
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 12px;
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
}

.thumb-wrapper {
  position: relative;
  width: 168px;
  height: 94.5px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.duration-badge {
  line-height: 1.3;
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: var(--on-accent);
  padding: 2px 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 2px;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
.badge-live { background: var(--danger); }

.video-info { flex: 1; }

.video-title-related {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-metadata {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
}

.re-actername{
  margin-bottom: 3px;
  font-size: 0.8rem;
}

.page-link { text-decoration: none; }

.dot { margin: 0 4px; }

@media (max-width: 999px) {
  .related-section { width: 100%; margin-top: 32px; }
  .related-item { gap: 10px; }
  .thumb-wrapper { width: 140px; height: 78.75px; }
  .video-title-related { font-size: 0.9rem; }
  .video-metadata { font-size: 0.8rem; }
  .duration-badge { font-size: 0.65rem; padding: 1px 2px; }
}
</style>
