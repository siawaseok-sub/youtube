<template>
  <div class="playlists-container">
    <div class="playlists-header">
      <h1>再生リスト</h1>
      <button class="create-btn" @click="creating = !creating">新規作成</button>
    </div>

    <div v-if="creating" class="create-row">
      <input v-model="newName" placeholder="プレイリスト名" />
      <button @click="createPlaylist" :disabled="!newName">作成</button>
    </div>

    <div v-if="loading" class="loading-msg">読み込み中...</div>
    <div v-else-if="playlists.length===0" class="empty-msg">プレイリストがありません</div>

    <div class="playlists-grid">
      <div v-for="pl in playlists" :key="pl.id" class="playlist-card">
        <div class="pl-thumb" @click="select(pl)">
          <img v-if="pl.thumbnail" :src="pl.thumbnail" />
          <div v-else class="pl-placeholder">{{ pl.name.charAt(0) || 'P' }}</div>
        </div>
        <div class="pl-info" @click="select(pl)">
          <div class="pl-name">{{ pl.name }}</div>
          <div class="pl-count">{{ pl.items?.length || 0 }}件</div>
        </div>
        <button class="pl-delete" @click.stop="deletePlaylist(pl.id)">削除</button>
      </div>
    </div>

    <div v-if="selected" class="playlist-detail">
      <h2>{{ selected.name }}</h2>
      <button @click="closeSelected">閉じる</button>
      <ul class="playlist-items">
        <li v-for="item in selected.items" :key="item.id">
          <img v-if="item.thumbnailBinary" :src="arrayBufferToDataUrl(item.thumbnailBinary)" class="item-thumb" />
          <div class="item-meta">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-sub">{{ item.authorName }} ・ {{ formatViews(item.views) }}回</div>
          </div>
          <button @click.stop="removeFromPlaylist(selected.id, item.id)">削除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPlaylists, createPlaylist as createPl, deletePlaylist as deletePl, getPlaylistById, removeVideoFromPlaylist } from '@/utils/playlistManager';

const playlists = ref([]);
const loading = ref(true);
const creating = ref(false);
const newName = ref('');
const selected = ref(null);

const load = async () => {
  loading.value = true;
  playlists.value = await getPlaylists();
  loading.value = false;
};

onMounted(load);

const createPlaylist = async () => {
  try {
    await createPl(newName.value, null);
    newName.value = '';
    creating.value = false;
    await load();
  } catch (e) { console.error(e); }
};

const deletePlaylist = async (id) => {
  if (!confirm('本当に削除しますか？')) return;
  try {
    await deletePl(id);
    await load();
  } catch (e) { console.error(e); }
};

const select = async (pl) => {
  try {
    const full = await getPlaylistById(pl.id);
    selected.value = full;
  } catch (e) { console.error(e); }
};

const closeSelected = () => { selected.value = null; };

const removeFromPlaylist = async (plId, videoId) => {
  try {
    await removeVideoFromPlaylist(plId, videoId);
    const full = await getPlaylistById(plId);
    selected.value = full;
    await load();
  } catch (e) { console.error(e); }
};

const formatViews = (v) => {
  if (!v) return '0';
  const n = parseInt(v,10); if (isNaN(n)) return v; return n.toLocaleString();
};

function arrayBufferToDataUrl(buf) {
  if (!buf) return null;
  try {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i=0;i<bytes.length;i++) binary += String.fromCharCode(bytes[i]);
    return 'data:image/jpeg;base64,' + btoa(binary);
  } catch (e) { return null; }
}
</script>

<style scoped>
/* Container */
.playlists-container{
  padding:24px;
  margin-left:250px;
  color:var(--text-primary);
}

.playlists-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:18px;
}

.playlists-header h1{font-size:1.6rem;margin:0}
.create-btn{background:var(--bg-secondary);border:1px solid var(--border-color);padding:8px 12px;border-radius:4px;color:var(--text-primary);cursor:pointer}
.create-btn:hover{background:var(--hover-bg)}

/* Create row */
.create-row{display:flex;gap:8px;margin-bottom:14px}
.create-row input{flex:1;padding:8px;border-radius:4px;border:1px solid var(--border-color);background:var(--bg-primary);color:var(--text-primary)}
.create-row button{padding:8px 12px;border-radius:4px;border:none;background:var(--accent-color);color:var(--on-accent);cursor:pointer}

/* Grid */
.playlists-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}

/* Playlist card (YouTube-like) */
.playlist-card{
  display:flex;flex-direction:column;overflow:hidden;border-radius:8px;background:var(--bg-primary);border:1px solid var(--border-color);box-shadow:0 1px 0 rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.04);transition:transform .12s ease,box-shadow .12s ease;
}
.playlist-card:hover{transform:translateY(-4px);box-shadow:0 6px 18px rgba(0,0,0,0.08)}

.pl-thumb{width:100%;height:0;padding-bottom:56.25%;position:relative;background:linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.02))}
.pl-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pl-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#666;color:#fff;font-size:28px}

.pl-info{padding:12px}
.pl-name{font-weight:600;font-size:1rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-count{color:var(--text-secondary);font-size:0.9rem;margin-top:6px}

.pl-delete{position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.5);color:#fff;border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .12s ease}
.playlist-card:hover .pl-delete{opacity:1}

/* Playlist detail */
.playlist-detail{margin-top:20px;padding-top:12px;border-top:1px solid var(--border-color)}
.playlist-detail h2{margin:0 0 8px 0}
.playlist-items{list-style:none;padding:0;margin:0}
.playlist-items li{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.03)}
.item-thumb{width:160px;height:90px;object-fit:cover;border-radius:6px}
.item-meta{flex:1;min-width:0}
.item-title{font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item-sub{color:var(--text-secondary);font-size:0.9rem;margin-top:6px}

/* Responsive */
@media (max-width: 1024px){.playlists-container{margin-left:70px;padding:18px}}
@media (max-width: 790px){.playlists-container{margin-left:0;padding:16px}.playlists-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}}
</style>

<style scoped>
.playlists-container {
  padding: 24px;
  margin-left: 250px;
}

h1 {
  color: var(--text-primary);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .playlists-container {
    margin-left: 200px;
  }
}
</style>
