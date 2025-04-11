// src/utils/sessionTimeout.ts
import { signOut } from '@/lib/firebase';

const SESSION_TIMEOUT_KEY = 'lastActivityTimestamp';
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes by default

export function setupSessionTimeout(timeoutMs = DEFAULT_TIMEOUT_MS) {
  // Record initial activity
  updateLastActivity();
  
  // Set up event listeners for user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  // Remove any existing listeners
  events.forEach(event => {
    window.removeEventListener(event, updateLastActivity);
  });
  
  // Add listeners to update activity timestamp
  events.forEach(event => {
    window.addEventListener(event, updateLastActivity);
  });
  
  // Start the check interval
  const intervalId = setInterval(() => checkSessionTimeout(timeoutMs), 60000); // Check every minute
  
  return () => {
    // Cleanup function to remove listeners and clear interval
    events.forEach(event => {
      window.removeEventListener(event, updateLastActivity);
    });
    clearInterval(intervalId);
  };
}

function updateLastActivity() {
  localStorage.setItem(SESSION_TIMEOUT_KEY, Date.now().toString());
}

export function checkSessionTimeout(timeoutMs = DEFAULT_TIMEOUT_MS): boolean {
  const lastActivity = localStorage.getItem(SESSION_TIMEOUT_KEY);
  
  if (!lastActivity) {
    // No activity recorded yet, update now
    updateLastActivity();
    return false;
  }
  
  const now = Date.now();
  const timeSinceLastActivity = now - parseInt(lastActivity);
  
  if (timeSinceLastActivity > timeoutMs) {
    // Session has expired
    return true;
  }
  
  return false;
}

export function getTimeRemaining(timeoutMs = DEFAULT_TIMEOUT_MS): number {
  const lastActivity = localStorage.getItem(SESSION_TIMEOUT_KEY);
  
  if (!lastActivity) {
    return timeoutMs;
  }
  
  const now = Date.now();
  const lastActivityTime = parseInt(lastActivity);
  const timeSinceLastActivity = now - lastActivityTime;
  
  return Math.max(0, timeoutMs - timeSinceLastActivity);
}

export function resetSession() {
  localStorage.removeItem(SESSION_TIMEOUT_KEY);
}