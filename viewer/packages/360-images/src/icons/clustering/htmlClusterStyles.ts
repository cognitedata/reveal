/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Generates CSS styles for HTML cluster icons.
 * @param classPrefix - The CSS class prefix for cluster elements
 * @returns The complete CSS stylesheet as a string
 */
export function generateClusterStyles(classPrefix: string): string {
  return `
.${classPrefix}-icon {
  --size: 80px;
  --outer-border: calc(var(--size) * 0.025);
  --inner-border: calc(var(--size) * 0.05);
  --innermost-border: calc(var(--size) * 0.1);
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  box-sizing: border-box;
  border: var(--outer-border) solid #FFFFFF;
  border-radius: 50%;
  filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.15));
  background: transparent;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: transform 0.15s ease-out;
  opacity: 0;
  animation: ${classPrefix}-fade-in 0.2s ease-out forwards;
}

.${classPrefix}-icon::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  box-sizing: border-box;
  background: transparent;
  border: var(--inner-border) solid #FFFFFF;
  z-index: 0;
}

.${classPrefix}-icon::after {
  content: '';
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  box-sizing: border-box;
  background: transparent;
  border: var(--innermost-border) solid rgba(255, 255, 255, 0.5);
  transition: border-color 0.15s ease-out;
  z-index: 0;
}

.${classPrefix}-icon.hovered::after {
  border-color: #8893CD;
}

.${classPrefix}-icon.hovered {
  transform: translate(-50%, -50%) scale(2.1);
}

.${classPrefix}-icon.fade-out {
  animation: ${classPrefix}-fade-out 0.15s ease-out forwards;
}

@keyframes ${classPrefix}-fade-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes ${classPrefix}-fade-out {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}

.${classPrefix}-count {
  position: relative;
  z-index: 1;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: inherit;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #FFFFFF;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px rgba(0, 0, 0, 0.8);
}
`;
}
