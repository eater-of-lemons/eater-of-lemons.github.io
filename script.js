(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  const tabList = document.querySelector('[role="tablist"]');
  const panelLinks = [...document.querySelectorAll('[data-panel-link], [data-go-to]')];
  const validPanels = new Set(tabs.map((tab) => tab.dataset.panel));
  const desktopTabs = window.matchMedia('(min-width: 801px)');

  const updateOrientation = () => {
    tabList.setAttribute('aria-orientation', desktopTabs.matches ? 'vertical' : 'horizontal');
  };

  updateOrientation();
  desktopTabs.addEventListener('change', updateOrientation);

  const panelFromHash = () => {
    const value = window.location.hash.slice(1);
    return validPanels.has(value) ? value : 'hello';
  };

  const showPanel = (name, { focusTab = false, updateHash = true } = {}) => {
    if (!validPanels.has(name)) return;

    tabs.forEach((tab) => {
      const active = tab.dataset.panel === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panelContent === name;
      panel.hidden = !active;
      panel.classList.toggle('is-entering', active);
      if (active) {
        window.setTimeout(() => panel.classList.remove('is-entering'), 240);
        panel.scrollTop = 0;
      }
    });

    if (updateHash && window.location.hash !== `#${name}`) {
      window.history.pushState(null, '', `#${name}`);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.panel));

    tab.addEventListener('keydown', (event) => {
      const vertical = desktopTabs.matches;
      const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
      let nextIndex = null;

      if (event.key === previousKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        showPanel(tabs[nextIndex].dataset.panel, { focusTab: true });
      }
    });
  });

  panelLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const name = link.dataset.panelLink || link.dataset.goTo;
      if (!validPanels.has(name)) return;
      event.preventDefault();
      showPanel(name, { focusTab: Boolean(link.dataset.goTo) });
    });
  });

  window.addEventListener('popstate', () => {
    showPanel(panelFromHash(), { updateHash: false });
  });

  showPanel(panelFromHash(), { updateHash: false });
})();
