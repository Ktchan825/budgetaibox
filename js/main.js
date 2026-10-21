(function () {
  const cfg = window.BAB_CONFIG;
  const dict = window.BAB_I18N;
  const money = (n) => cfg.currencySymbol + n.toLocaleString("en-US");

  const vars = {
    price: cfg.price,
    deposit: cfg.deposit,
    balance: cfg.price - cfg.deposit,
    ship: cfg.shipWindow,
    batch: cfg.batchSize,
    year: new Date().getFullYear(),
  };

  // Dictionary strings are authored by us, so they may contain markup.
  function fill(str) {
    // ${key} = money, {key} = plain value. Money first, or {key} would eat the inner braces.
    return str
      .replace(/\$\{(\w+)\}/g, (m, k) => (k in vars ? money(vars[k]) : m))
      .replace(/\{(\w+)\}/g, (m, k) =>
        k === "email" ? `<a href="mailto:${cfg.email}">${cfg.email}</a>` : (k in vars ? vars[k] : m));
  }
  function fillText(str) {
    return fill(str).replace(/<[^>]+>/g, "");
  }

  let lang = "en";
  function t(key) {
    return (dict[lang] && dict[lang][key]) ?? dict.en[key] ?? key;
  }

  function applyLang(next) {
    lang = dict[next] ? next : "en";
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.title = fillText(t("meta.title"));

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const s = t(el.dataset.i18n);
      // Elements whose strings contain {email} get a real link; others stay plain text.
      if (s.includes("{email}")) el.innerHTML = fill(s);
      else el.textContent = fillText(s);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = fill(t(el.dataset.i18nHtml));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = fillText(t(el.dataset.i18nPlaceholder));
    });
    renderSpecs();
    renderReviews();
    try { localStorage.setItem("bab-lang", lang); } catch (e) {}
  }

  function renderSpecs() {
    const tbody = document.getElementById("spec-rows");
    if (!tbody) return;
    tbody.innerHTML = "";
    cfg.specs.forEach(({ key, value }) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = t("spec." + key);
      const td = document.createElement("td");
      td.textContent = value;
      if (value === "TBC") td.className = "tbc";
      tr.append(th, td);
      tbody.append(tr);
    });
  }

  function renderReviews() {
    const list = document.getElementById("review-list");
    if (!list) return;
    list.innerHTML = "";
    if (!cfg.reviews.length) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = t("rev.empty");
      list.append(p);
      return;
    }
    cfg.reviews.forEach((r) => {
      const card = document.createElement("article");
      card.className = "review";
      const q = document.createElement("blockquote");
      q.textContent = "“" + r.quote + "”";
      const src = document.createElement("p");
      src.className = "muted";
      src.textContent = r.source + " — " + r.title;
      const a = document.createElement("a");
      a.className = "link";
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = t("rev.read") + " ↗";
      card.append(q, src, a);
      list.append(card);
    });
  }

  function staticFills() {
    document.querySelectorAll("[data-price]").forEach((el) => (el.textContent = money(cfg[el.dataset.price])));
    // Competitor US list prices, converted and marked as approximate.
    document.querySelectorAll("[data-usd]").forEach((el) => {
      const usd = Number(el.dataset.usd);
      el.textContent = usd === 0 ? money(0) : "≈" + money(Math.round((usd * cfg.usdToLocal) / 10) * 10);
    });
    document.querySelectorAll('[data-fill="ship"]').forEach((el) => (el.textContent = cfg.shipWindow));
    document.querySelectorAll('[data-show-if="batch"]').forEach((el) => (el.hidden = !cfg.batchSize));
    const gh = document.getElementById("github-link");
    if (cfg.githubUrl) {
      gh.href = cfg.githubUrl;
      gh.hidden = false;
      document.getElementById("docs-soon").hidden = true;
    }
  }

  // Initial language: ?lang= → saved → browser
  const params = new URLSearchParams(location.search);
  let saved = null;
  try { saved = localStorage.getItem("bab-lang"); } catch (e) {}
  const browserZh = /^zh/i.test(navigator.language || "");
  staticFills();
  applyLang(params.get("lang") || saved || (browserZh ? "zh" : "en"));

  document.querySelectorAll("[data-lang-toggle]").forEach((btn) =>
    btn.addEventListener("click", () => applyLang(lang === "en" ? "zh" : "en")));

  // Pre-order form: always gives visible feedback (loading, success, redirect or error).
  const form = document.getElementById("order-form");
  const status = document.getElementById("order-status");
  const submit = document.getElementById("order-submit");
  const emailInput = document.getElementById("order-email");

  function setStatus(kind, key) {
    status.className = "status " + kind;
    status.innerHTML = fill(t(key));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error", "order.invalid");
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute("aria-invalid");
    submit.disabled = true;
    submit.classList.add("loading");
    setStatus("info", "order.loading");

    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          updates: form.updates.checked,
          lang,
          company: form.company.value, // honeypot
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "HTTP " + res.status);

      if (data.checkoutUrl) {
        setStatus("success", "order.redirect");
        window.location.href = data.checkoutUrl;
        return;
      }
      setStatus("success", "order.success");
      form.reset();
    } catch (err) {
      console.error("Pre-order failed:", err);
      setStatus("error", "order.error");
    } finally {
      submit.disabled = false;
      submit.classList.remove("loading");
    }
  });

  // Stripe sends people back here after paying the deposit.
  if (params.get("reserved") === "1") {
    setStatus("success", "order.reserved");
    document.getElementById("preorder").scrollIntoView();
  }
})();
