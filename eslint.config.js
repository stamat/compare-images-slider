import js from '@eslint/js';

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  CustomEvent: 'readonly',
  HTMLElement: 'readonly',
  customElements: 'readonly'
};

export default [
  { ignores: ['dist/**', 'js/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: browserGlobals }
  },
  {
    files: ['test/**/*.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { console: 'readonly', process: 'readonly' } }
  }
];
