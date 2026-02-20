/**
 * Vitest setup for River Side Herald
 */
import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  localStorage.clear();
});
