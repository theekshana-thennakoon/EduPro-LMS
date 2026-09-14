import { supabase, isSupabaseConfigured } from './supabaseClient';

const DB_NAME = 'edupro_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

// In-memory cache for generated Object URLs to avoid duplicate memory allocation
const objectUrlCache = new Map();

/**
 * Open or initialize the IndexedDB database
 */
const openDb = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
};

export const mediaStorageService = {
  /**
   * Save a File or Blob into IndexedDB
   * @param {File|Blob} fileOrBlob 
   * @param {string} [customId] 
   * @returns {Promise<{ id: string, url: string, previewUrl: string, size: number, type: string, fileName: string, isCloud: boolean }>}
   */
  saveMediaBlob: async (fileOrBlob, customId = null) => {
    const id = customId || `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = fileOrBlob.name || `${id}.${fileOrBlob.type?.split('/')[1] || 'bin'}`;
    const mimeType = fileOrBlob.type || 'application/octet-stream';
    const size = fileOrBlob.size || 0;

    // Optional: If Supabase Storage is configured and public bucket exists
    if (isSupabaseConfigured() && supabase) {
      try {
        const fileExt = fileName.split('.').pop();
        const cloudPath = `lessons/${id}.${fileExt}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('lesson-videos')
          .upload(cloudPath, fileOrBlob, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('lesson-videos')
            .getPublicUrl(cloudPath);

          if (publicUrlData?.publicUrl) {
            return {
              id,
              url: publicUrlData.publicUrl,
              previewUrl: publicUrlData.publicUrl,
              size,
              type: mimeType,
              fileName,
              isCloud: true
            };
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload bypassed/failed, falling back to local IndexedDB:', err);
      }
    }

    // Fallback/Default: High-performance local IndexedDB storage
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id,
        blob: fileOrBlob,
        fileName,
        mimeType,
        size,
        createdAt: new Date().toISOString()
      };

      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        // Create an active Object URL for instant immediate preview/playback
        const objectUrl = URL.createObjectURL(fileOrBlob);
        objectUrlCache.set(id, objectUrl);

        resolve({
          id,
          url: `indexeddb://${id}`,
          previewUrl: objectUrl,
          size,
          type: mimeType,
          fileName,
          isCloud: false
        });
      };

      putRequest.onerror = () => reject(putRequest.error || new Error('Failed to store media blob in IndexedDB'));
    });
  },

  /**
   * Retrieve a stored Blob from IndexedDB by ID
   * @param {string} id 
   * @returns {Promise<Blob|null>}
   */
  getMediaBlob: async (id) => {
    if (!id) return null;
    const cleanId = id.replace(/^indexeddb:\/\//, '');

    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(cleanId);

      getRequest.onsuccess = () => {
        if (getRequest.result && getRequest.result.blob) {
          resolve(getRequest.result.blob);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => reject(getRequest.error || new Error(`Failed to read media ${id}`));
    });
  },

  /**
   * Get or create a live Object URL for a stored media ID
   * @param {string} id 
   * @returns {Promise<string|null>}
   */
  getMediaUrl: async (id) => {
    if (!id) return null;
    const cleanId = id.replace(/^indexeddb:\/\//, '');

    if (objectUrlCache.has(cleanId)) {
      return objectUrlCache.get(cleanId);
    }

    const blob = await mediaStorageService.getMediaBlob(cleanId);
    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    objectUrlCache.set(cleanId, objectUrl);
    return objectUrl;
  },

  /**
   * Delete a stored Blob from IndexedDB
   * @param {string} id 
   */
  deleteMediaBlob: async (id) => {
    if (!id) return true;
    const cleanId = id.replace(/^indexeddb:\/\//, '');

    if (objectUrlCache.has(cleanId)) {
      try {
        URL.revokeObjectURL(objectUrlCache.get(cleanId));
      } catch (e) {
        // ignore revoke error
      }
      objectUrlCache.delete(cleanId);
    }

    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const delReq = store.delete(cleanId);
        delReq.onsuccess = () => resolve(true);
        delReq.onerror = () => reject(delReq.error);
      });
    } catch (e) {
      console.warn('Could not delete media blob from IndexedDB:', e);
      return false;
    }
  },

  /**
   * Universal URL resolver for lessons: handles IndexedDB, YouTube, Google Drive, Vimeo, or standard URLs
   * @param {string|object} videoOrUrl 
   * @returns {Promise<string>}
   */
  resolveMediaUrl: async (videoOrUrl) => {
    if (!videoOrUrl) return '';
    const rawUrl = typeof videoOrUrl === 'object' ? (videoOrUrl.url || videoOrUrl.mediaId || '') : videoOrUrl;
    if (!rawUrl) return '';

    // 1. IndexedDB identifier (indexeddb://media-xxx)
    if (rawUrl.startsWith('indexeddb://')) {
      const resolved = await mediaStorageService.getMediaUrl(rawUrl);
      return resolved || '';
    }

    // 2. YouTube link conversion to embed format
    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
      let videoId = '';
      if (rawUrl.includes('youtu.be/')) {
        videoId = rawUrl.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
      } else if (rawUrl.includes('youtube.com/watch')) {
        const match = rawUrl.match(/[?&]v=([^&#]+)/);
        videoId = match ? match[1] : '';
      } else if (rawUrl.includes('youtube.com/embed/')) {
        return rawUrl;
      } else if (rawUrl.includes('youtube.com/shorts/')) {
        videoId = rawUrl.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0] || '';
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
      }
      return rawUrl;
    }

    // 3. Google Drive video preview conversion
    if (rawUrl.includes('drive.google.com')) {
      let fileId = '';
      const match1 = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const match2 = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match1) fileId = match1[1];
      else if (match2) fileId = match2[1];

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return rawUrl;
    }

    // 4. Vimeo video link conversion
    if (rawUrl.includes('vimeo.com') && !rawUrl.includes('player.vimeo.com')) {
      const match = rawUrl.match(/vimeo\.com\/(\d+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }

    // 5. Direct MP4/WebM or external URL
    return rawUrl;
  }
};
