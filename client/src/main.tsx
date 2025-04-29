import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply dark mode by default for SCP aesthetic
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
