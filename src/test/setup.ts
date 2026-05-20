/**
 * Vitest setup for River Side Herald
 */
import { createElement, type ReactNode } from 'react';
import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => createElement('a', { href, ...rest }, children),
}));

beforeEach(() => {
  localStorage.clear();
});
