"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook to execute a callback function periodically.
 * 
 * @param {Function} callback Function to execute every interval
 * @param {number|null} delay Interval delay in milliseconds (null to pause/disable)
 */
export function usePolling(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;

    savedCallback.current();

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}