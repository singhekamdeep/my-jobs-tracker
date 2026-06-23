/**
 * Simple in-memory cache with TTL support.
 * Replaces Redis for lightweight caching of AI extraction results.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class CacheService {
  private store: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: ReturnType<typeof setInterval>

  constructor(cleanupIntervalMs: number = 60_000) {
    // Periodically sweep expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  /**
   * Get a value from cache. Returns undefined if not found or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  /**
   * Set a value in cache with TTL in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a specific key from cache.
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Remove all expired entries.
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy the cache (clear interval).
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Export a singleton instance — 1 minute cleanup sweeps
export const cache = new CacheService(60_000)
