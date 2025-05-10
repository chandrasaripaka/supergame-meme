// Simple in-memory cache service for LLM responses
import { CacheEntry, LLMResponse } from '../models/types';

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;

  constructor(ttlSeconds: number = 3600) {  // Default 1 hour TTL
    this.ttlMs = ttlSeconds * 1000;
    
    // Periodically clean expired entries
    setInterval(() => this.cleanExpiredEntries(), 60000);  // Every minute
  }

  set(prompt: string, response: LLMResponse, embedding?: number[]): void {
    const now = Date.now();
    const expiresAt = now + this.ttlMs;
    
    this.cache.set(prompt, {
      prompt,
      embedding,
      response,
      timestamp: now,
      expiresAt
    });
  }

  get(prompt: string): LLMResponse | null {
    const entry = this.cache.get(prompt);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(prompt);
      return null;
    }
    
    return entry.response;
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // Simplified approach to avoid iterator issues
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    // Delete expired entries
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }
}