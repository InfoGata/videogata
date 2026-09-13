import { runPendingAppDataReset } from "./lib/reset-app-data";

// The reset has to finish before the app's modules are even evaluated, not just
// before it renders. Static imports are hoisted, and importing the store runs
// persistStore, which reads the persisted state from localStorage on the spot
// and writes it back after rehydrating -- so a reset awaited in the same module
// as those imports clears the flag and nothing else. Hence the dynamic import.
// A no-op unless the error boundary's reset button was used.
await runPendingAppDataReset();
await import("./render-app");
