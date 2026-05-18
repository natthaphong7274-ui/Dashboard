// ============================================================
//  Cache.gs — Phase 7.1 Dashboard CacheService helpers
//  - 300s TTL by default
//  - chunked JSON values to stay under CacheService item limits
//  - deterministic hashed keys so role/scope payloads do not collide
// ============================================================

function _cacheHash(value) {
  var input = String(value || '');
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  return digest.map(function(b) {
    return ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2);
  }).join('').slice(0, 32);
}

function _cacheJsonKey(prefix, parts) {
  return String(prefix || 'dash') + ':' + _cacheHash((parts || []).join('|'));
}

function _cachePutJson(key, value, ttlSeconds) {
  try {
    var cache = CacheService.getScriptCache();
    var ttl = Number(ttlSeconds || DASH_CACHE_TTL_SECONDS || 300);
    var json = JSON.stringify(value);
    var chunkSize = Number(DASH_CACHE_CHUNK_CHARS || 25000);
    var maxChunks = Number(DASH_CACHE_MAX_CHUNKS || 80);
    var chunks = [];

    for (var i = 0; i < json.length; i += chunkSize) {
      chunks.push(json.substring(i, i + chunkSize));
      if (chunks.length > maxChunks) {
        throw new Error('Cache payload too large for chunk guard');
      }
    }

    var meta = {
      version: 1,
      chunks: chunks.length,
      length: json.length,
      ttlSeconds: ttl,
      createdAt: _bkkTimestamp()
    };
    cache.put(key + ':meta', JSON.stringify(meta), ttl);
    chunks.forEach(function(chunk, idx) {
      cache.put(key + ':' + idx, chunk, ttl);
    });
    return { ok: true, chunks: chunks.length, length: json.length, ttlSeconds: ttl };
  } catch (e) {
    Logger.log('_cachePutJson error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function _cacheGetJson(key) {
  try {
    var cache = CacheService.getScriptCache();
    var rawMeta = cache.get(key + ':meta');
    if (!rawMeta) return null;

    var meta = JSON.parse(rawMeta);
    var chunks = [];
    for (var i = 0; i < Number(meta.chunks || 0); i++) {
      var part = cache.get(key + ':' + i);
      if (part === null || part === undefined) return null;
      chunks.push(part);
    }

    var value = JSON.parse(chunks.join(''));
    return { value: value, meta: meta };
  } catch (e) {
    Logger.log('_cacheGetJson error: ' + e.message);
    return null;
  }
}

function _cacheRemoveJson(key) {
  try {
    var cache = CacheService.getScriptCache();
    var keys = [key + ':meta'];
    for (var i = 0; i < Number(DASH_CACHE_MAX_CHUNKS || 80); i++) {
      keys.push(key + ':' + i);
    }
    cache.removeAll(keys);
    return { ok: true };
  } catch (e) {
    Logger.log('_cacheRemoveJson error: ' + e.message);
    return { ok: false, error: e.message };
  }
}
