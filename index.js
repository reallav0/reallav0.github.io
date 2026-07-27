(() => {
  "use strict";

  const copyrightYear = document.getElementById("copyrightYear");
  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeState = document.querySelector("[data-theme-state]");
  const themeStorageKey = "av0-theme";
  const colorSchemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const validTheme = (value) => value === "light" || value === "dark";
  const systemTheme = () => colorSchemeMedia.matches ? "dark" : "light";

  const readSavedTheme = () => {
    try {
      const value = window.localStorage.getItem(themeStorageKey);
      return validTheme(value) ? value : null;
    } catch {
      return null;
    }
  };

  let hasManualTheme = Boolean(readSavedTheme());

  const applyTheme = (theme, persist = false) => {
    const nextTheme = validTheme(theme) ? theme : systemTheme();
    const isDark = nextTheme === "dark";

    root.dataset.theme = nextTheme;
    themeToggle?.setAttribute("aria-checked", String(isDark));
    if (themeState) themeState.textContent = isDark ? "On" : "Off";

    if (!persist) return;
    hasManualTheme = true;
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // The selected theme still applies for this session when storage is unavailable.
    }
  };

  const initialTheme = validTheme(root.dataset.theme)
    ? root.dataset.theme
    : readSavedTheme() || systemTheme();
  applyTheme(initialTheme);

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  const handleSystemThemeChange = (event) => {
    if (!hasManualTheme) applyTheme(event.matches ? "dark" : "light");
  };

  if (typeof colorSchemeMedia.addEventListener === "function") {
    colorSchemeMedia.addEventListener("change", handleSystemThemeChange);
  } else if (typeof colorSchemeMedia.addListener === "function") {
    colorSchemeMedia.addListener(handleSystemThemeChange);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== themeStorageKey) return;
    const externalTheme = validTheme(event.newValue) ? event.newValue : null;
    hasManualTheme = Boolean(externalTheme);
    applyTheme(externalTheme || systemTheme());
  });

  root.classList.add("theme-ready");

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));
  const filterStatus = document.getElementById("filterStatus");

  const applyProjectFilter = (filter) => {
    let visibleCount = 0;

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const isVisible = filter === "all" || categories.includes(filter);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (filterStatus) {
      const noun = visibleCount === 1 ? "project" : "projects";
      filterStatus.textContent = `Showing ${visibleCount} ${noun}.`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.getAttribute("aria-disabled") === "true") return;
      applyProjectFilter(button.dataset.filter || "all");
    });
  });

  document.documentElement.classList.add("filters-ready");

  const dialog = document.getElementById("commandDialog");
  const commandInput = document.getElementById("commandInput");
  const commandEmpty = document.getElementById("commandEmpty");
  const commandCount = document.getElementById("commandCount");
  const openButtons = Array.from(document.querySelectorAll("[data-command-open]"));
  const closeButton = document.querySelector("[data-command-close]");
  const commandItems = Array.from(document.querySelectorAll("[data-command-item]"));

  if (
    !dialog
    || !commandInput
    || commandItems.length === 0
    || typeof dialog.showModal !== "function"
    || typeof dialog.close !== "function"
  ) return;

  let activeIndex = 0;
  let lastFocusedElement = null;
  let countAnnouncementTimer = 0;

  const visibleCommandItems = () => commandItems.filter((item) => !item.hidden);

  const setActiveItem = (nextIndex) => {
    const visibleItems = visibleCommandItems();

    commandItems.forEach((item) => item.setAttribute("aria-selected", "false"));

    if (visibleItems.length === 0) {
      commandInput.removeAttribute("aria-activedescendant");
      activeIndex = -1;
      return;
    }

    const wrappedIndex = ((nextIndex % visibleItems.length) + visibleItems.length) % visibleItems.length;
    const activeItem = visibleItems[wrappedIndex];
    activeIndex = wrappedIndex;
    activeItem.setAttribute("aria-selected", "true");
    commandInput.setAttribute("aria-activedescendant", activeItem.id);
    activeItem.scrollIntoView({ block: "nearest" });
  };

  const announceResultCount = (count) => {
    window.clearTimeout(countAnnouncementTimer);
    countAnnouncementTimer = window.setTimeout(() => {
      if (!commandCount) return;
      const noun = count === 1 ? "result" : "results";
      commandCount.textContent = `${count} ${noun} available.`;
    }, 250);
  };

  const filterCommands = () => {
    const query = commandInput.value.trim().toLocaleLowerCase();

    commandItems.forEach((item) => {
      const searchText = `${item.textContent} ${item.dataset.search || ""}`.toLocaleLowerCase();
      item.hidden = query.length > 0 && !searchText.includes(query);
    });

    const visibleItems = visibleCommandItems();
    if (commandEmpty) commandEmpty.hidden = visibleItems.length > 0;
    setActiveItem(0);
    announceResultCount(visibleItems.length);
  };

  const openCommandDialog = () => {
    if (dialog.open) return;
    lastFocusedElement = document.activeElement;
    document.body.classList.add("command-open");

    dialog.showModal();

    commandInput.value = "";
    filterCommands();
    window.requestAnimationFrame(() => commandInput.focus({ preventScroll: true }));
  };

  const closeCommandDialog = () => {
    if (!dialog.open) return;

    dialog.close();
  };

  openButtons.forEach((button) => button.addEventListener("click", openCommandDialog));
  closeButton?.addEventListener("click", closeCommandDialog);

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) closeCommandDialog();
      else openCommandDialog();
    }
  });

  commandInput.addEventListener("input", filterCommands);

  commandInput.addEventListener("keydown", (event) => {
    const visibleItems = visibleCommandItems();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveItem(activeIndex + 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveItem(activeIndex - 1);
    }

    if (event.key === "Enter" && visibleItems.length > 0) {
      event.preventDefault();
      visibleItems[Math.max(activeIndex, 0)].click();
    }
  });

  commandItems.forEach((item) => {
    item.addEventListener("pointermove", () => {
      const visibleItems = visibleCommandItems();
      const hoveredIndex = visibleItems.indexOf(item);
      if (hoveredIndex >= 0) setActiveItem(hoveredIndex);
    });

    item.addEventListener("click", () => {
      const destination = item.getAttribute("href") || "";
      if (destination.startsWith("#project-")) applyProjectFilter("all");
      closeCommandDialog();
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeCommandDialog();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("command-open");
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  });

  document.documentElement.classList.add("command-ready");
})();
