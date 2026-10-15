/**
 * Wrapper de localStorage para persistencia de récords.
 */

import type { BestRecord } from './types';

const STORAGE_KEY = 'little-grand-prix-records';

export function loadRecords(): Record<string, BestRecord> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (error) {
    console.warn('Error loading records from localStorage:', error);
    return {};
  }
}

export function saveRecord(record: BestRecord): boolean {
  try {
    const records = loadRecords();
    const existing = records[record.trackName];
    
    // Solo guardar si es mejor tiempo o no existe
    if (!existing || record.bestTime < existing.bestTime) {
      records[record.trackName] = record;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true; // Nuevo récord
    }
    return false; // No es mejor
  } catch (error) {
    console.warn('Error saving record to localStorage:', error);
    return false;
  }
}

export function getBestRecord(trackName: string): BestRecord | null {
  const records = loadRecords();
  return records[trackName] || null;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}
