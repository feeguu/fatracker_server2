// In-memory cache

const cache = new Map();
const timers = new Map(); // carries the reference to the timer for each key

class CacheService {
  get(key) {
    return cache.get(key);
  }

  set(key, value, ttl) {
    cache.set(key, value);
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
    }
    timers.set(
      key,
      setTimeout(() => {
        cache.delete(key);
        timers.delete(key);
      }, ttl)
    );
  }

  delete(key) {
    cache.delete(key);
    clearTimeout(timers.get(key));
    timers.delete(key);
  }
}

module.exports = { CacheService };
