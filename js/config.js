// Single source of truth for product facts and links.
// Anything marked "TBC" could not be recovered from the old site — please fill it in.
window.BAB_CONFIG = {
  price: 2250,           // HKD, one-time (≈ US$289)
  deposit: 150,          // HKD, refundable; must match the Stripe Payment Link amount
  currency: "HKD",
  currencySymbol: "HK$",
  usdToLocal: 7.8,       // converts US list prices in the comparison table
  batchSize: null,       // units in the first batch, e.g. 100 (null hides it — no fake urgency)
  shipWindow: "TBC",     // e.g. "Q1 2027"
  email: "hello@budgetaibox.com",
  githubUrl: "",         // e.g. "https://github.com/budgetaibox/budgetaibox" — hidden if empty
  docsUrl: "#docs",

  // Core specs shown in the hero and the full spec table.
  specs: [
    { key: "memory",   value: "32GB" },
    { key: "storage",  value: "TBC" },
    { key: "cpu",      value: "TBC" },
    { key: "accel",    value: "TBC" },
    { key: "network",  value: "TBC" },
    { key: "power",    value: "TBC" },
    { key: "os",       value: "Linux (Ubuntu LTS)" },
    { key: "stack",    value: "Docker, Ollama, Open WebUI" },
    { key: "models",   value: "Llama, Qwen, Mistral, Gemma, Whisper" },
    { key: "warranty", value: "TBC" },
  ],

  // Independent reviews / benchmarks. Only add real, linkable ones.
  // { source: "Site name", title: "Headline", url: "https://…", quote: "Short quote" }
  reviews: [],
};
