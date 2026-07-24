export async function interceptDemoApi(page) {
  await page.route('**/demo-api.js', async route => {
    const response = await route.fetch();
    let body = await response.text();
    body += `
(function() {
  window.__apiCalls = window.__apiCalls || new Set();
  if (window.__apiPatched) return;
  window.__apiPatched = true;
  for (const key of Object.keys(demoApi)) {
    if (typeof demoApi[key] === 'function') {
      const orig = demoApi[key];
      demoApi[key] = function() {
        window.__apiCalls.add(key);
        return orig.apply(this, arguments);
      };
    }
  }
})();
`;
    await route.fulfill({
      response,
      body,
      headers: { ...response.headers(), 'content-type': 'application/javascript' },
    });
  });
}

export async function getApiCalls(page) {
  return page.evaluate(() => {
    return window.__apiCalls ? Array.from(window.__apiCalls) : [];
  });
}
