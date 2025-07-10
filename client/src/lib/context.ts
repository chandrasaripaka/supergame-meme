// Global context management for reset functionality
let globalResetContext: (() => void) | null = null;

export const setResetContextFunction = (fn: () => void) => {
  globalResetContext = fn;
};

export const getResetContextFunction = () => globalResetContext;

export const clearResetContextFunction = () => {
  globalResetContext = null;
};