import { defineTheme } from '@astryxdesign/core/theme';
import {
  neutralTheme,
  neutralIconRegistry,
} from '@astryxdesign/theme-neutral/built';

export const gencompassTheme = defineTheme({
  name: 'gencompass-neutral',
  extends: neutralTheme,
  icons: neutralIconRegistry,
  tokens: {
    '--color-background-body': ['#f7f7f7', '#1b1b1b'],
  },
  components: {
    stepper: {
      base: { width: 'auto' },
    },
    step: {
      base: {
        flex: '0 0 auto',
        alignItems: 'flex-start',
        '--text-body-size': 'var(--font-size-sm)',
      },
    },
    'step-bar': {
      base: { display: 'none' },
    },
    'step-indicator': {
      base: {
        width: 'var(--spacing-6)',
        height: 'var(--spacing-6)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-sm)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        '::before': { content: '"0"' },
      },
      'progress:not-started': {
        backgroundColor: 'transparent',
        border: 'var(--border-width) solid var(--color-border)',
      },
    },
    link: {
      'color:accent': { '--color-text-accent': 'var(--color-text-blue)' },
    },
    'side-nav': {
      base: { width: 'calc(var(--spacing-1) * 58)' },
      'mode:topbar': { width: '100%' },
    },
    'side-nav-heading': {
      base: {
        '--text-large-size': 'var(--font-size-xl)',
        '--text-supporting-size': 'var(--font-size-xs)',
      },
    },
    'side-nav-item': {
      base: {
        height: 'var(--spacing-12)',
        paddingInline: 'var(--spacing-3)',
        gap: 'var(--spacing-3)',
      },
      'selected:selected': {
        backgroundColor:
          'color-mix(in srgb, var(--color-background-blue) 32%, var(--color-background-surface))',
        color: 'var(--color-text-blue)',
      },
    },
  },
});
