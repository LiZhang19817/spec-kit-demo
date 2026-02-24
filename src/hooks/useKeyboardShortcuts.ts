/**
 * useKeyboardShortcuts Hook
 * Manages global keyboard shortcuts
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: (event: KeyboardEvent) => void;
  description: string;
}

/**
 * Custom hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const modifierMatch =
          (!shortcut.ctrl || event.ctrlKey) &&
          (!shortcut.cmd || event.metaKey) &&
          (!shortcut.shift || event.shiftKey) &&
          (!shortcut.alt || event.altKey);

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modifierMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Check if user is on Mac (for Cmd vs Ctrl)
 */
export function isMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}
