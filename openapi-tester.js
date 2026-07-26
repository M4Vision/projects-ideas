const METHOD_COLORS = {
  get: '#22C55E', post: '#3B82F6', put: '#F59E0B', patch: '#F59E0B', delete: '#EF4444',
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function methodBadge(method) {
  const c = METHOD_COLORS[method] || '#888'
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;background:${c}22;color:${c}">${method}</span>`
}

function getParams() {
  const urlInput = document.getElementById('apiUrlInput')
  const tokenInput = document.getElementById('apiTokenInput')
  return {
    apiUrl: (urlInput?.value || '/api').replace(/\/+$/, ''),
    token: tokenInput?.value || '',
  }
}

function getSpec() {
  return window._openapiSpec || null
}

function extractPathParams(path) {
  const matches = path.match(/\{(\w+)\}/g) || []
  return matches.map(m => m.slice(1, -1))
}

function generatePathInputs(names) {
  if (names.length === 0) return ''
  return `<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px">Path Parameters</div>${names.map(n => `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><code style="font-size:12px;width:80px;flex-shrink:0">${escapeHtml(n)}</code><input class="try-path-input" data-param="${escapeHtml(n)}" value="${n === 'id' || n.endsWith('Id') ? '1' : ''}" style="flex:1;padding:4px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--fg);outline:none" /></div>`).join('')}</div>`
}

function generateQueryInputs(params) {
  const queryParams = (params || []).filter(p => p.in === 'query')
  if (queryParams.length === 0) return ''
  return `<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px">Query Parameters</div>${queryParams.map(p => `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px"><code style="font-size:12px;width:80px;flex-shrink:0">${escapeHtml(p.name)}</code><input class="try-query-input" data-param="${escapeHtml(p.name)}" placeholder="${escapeHtml(p.description || '')}" style="flex:1;padding:4px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--fg);outline:none" /></div>`).join('')}</div>`
}

function exampleFromSchema(s, depth) {
  if (!s || depth > 3) return 'null'
  if (s.$ref) return 'null'
  if (s.example !== undefined) return JSON.stringify(s.example)
  if (s.type === 'string') return JSON.stringify(s.enum ? s.enum[0] : 'string')
  if (s.type === 'number' || s.type === 'integer') return s.type === 'integer' ? '1' : '1.0'
  if (s.type === 'boolean') return 'true'
  if (s.type === 'array') return '[]'
  if (s.type === 'object' || s.properties) {
    if (depth > 2) return '{}'
    const props = Object.entries(s.properties || {}).map(([k, v]) => {
      return `  ${JSON.stringify(k)}: ${exampleFromSchema(v, depth + 1)}`
    })
    return '{\n' + props.join(',\n') + '\n}'
  }
  return 'null'
}

function generateBodyEditor(schema) {
  if (!schema) return ''
  const example = exampleFromSchema(schema, 0)
  return `<div style="margin-bottom:8px"><div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:4px">Request Body (JSON)</div><textarea class="try-body-input" rows="4" style="width:100%;padding:8px;font-size:12px;font-family:monospace;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--fg);outline:none;resize:vertical;tab-size:2">${escapeHtml(example)}</textarea></div>`
}

function populateTryPanel(endpointId, panel) {
  const card = document.querySelector(`[data-endpoint="${endpointId}"]`)
  if (!card) return
  const path = card.dataset.path
  const method = card.dataset.method
  const spec = getSpec()

  let op = null
  if (spec) {
    for (const [p, methods] of Object.entries(spec.paths)) {
      if (p === path && methods[method]) {
        op = methods[method]
        break
      }
    }
  }

  const pathParamNames = extractPathParams(path)
  const params = op?.parameters || []

  panel.innerHTML = `
    ${generatePathInputs(pathParamNames)}
    ${generateQueryInputs(params)}
    ${generateBodyEditor(op?.requestBody?.content?.['application/json']?.schema)}
    <div style="display:flex;gap:8px;align-items:center">
      <button class="send-btn" style="padding:6px 16px;font-size:12px;border:none;border-radius:4px;background:#22C55E;color:#fff;cursor:pointer;font-weight:600">🚀 Send</button>
      <span class="try-status" style="font-size:12px;color:var(--text-secondary)"></span>
    </div>
    <div class="try-response" style="display:none;margin-top:8px"></div>
  `
}

async function sendRequest(card, panel) {
  const { apiUrl, token } = getParams()
  const path = card.dataset.path
  const method = card.dataset.method

  let finalPath = path
  const pathInputs = panel.querySelectorAll('.try-path-input')
  pathInputs.forEach(input => {
    finalPath = finalPath.replace(`{${input.dataset.param}}`, encodeURIComponent(input.value || ''))
  })

  const queryInputs = panel.querySelectorAll('.try-query-input')
  const queryParts = []
  queryInputs.forEach(input => {
    if (input.value) {
      queryParts.push(`${encodeURIComponent(input.dataset.param)}=${encodeURIComponent(input.value)}`)
    }
  })
  const queryStr = queryParts.length > 0 ? '?' + queryParts.join('&') : ''

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token

  let body = null
  const bodyInput = panel.querySelector('.try-body-input')
  if (bodyInput && bodyInput.value.trim()) {
    try {
      body = JSON.stringify(JSON.parse(bodyInput.value))
    } catch {
      body = bodyInput.value
    }
  } else if (method === 'GET' || method === 'DELETE') {
    body = undefined
  }

  const statusEl = panel.querySelector('.try-status')
  const responseEl = panel.querySelector('.try-response')
  responseEl.style.display = 'none'

  statusEl.textContent = '⏳ Envoi…'
  const startTime = performance.now()

  try {
    const url = apiUrl + finalPath + queryStr
    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      body: body || undefined,
    })
    const elapsed = Math.round(performance.now() - startTime)

    let responseData = null
    let responseText = ''
    try {
      responseText = await res.text()
      responseData = responseText ? JSON.parse(responseText) : null
    } catch {
      responseData = responseText || null
    }

    const statusColor = res.status < 300 ? '#22C55E' : res.status < 500 ? '#F59E0B' : '#EF4444'

    let bodyHtml = ''
    if (responseData && typeof responseData === 'object') {
      bodyHtml = `<pre style="margin:8px 0 0;padding:12px;background:var(--bg);border-radius:4px;overflow-x:auto;font-size:12px;line-height:1.5">${escapeHtml(JSON.stringify(responseData, null, 2))}</pre>`
    } else if (responseData) {
      bodyHtml = `<pre style="margin:8px 0 0;padding:12px;background:var(--bg);border-radius:4px;overflow-x:auto;font-size:12px;line-height:1.5">${escapeHtml(String(responseData))}</pre>`
    }

    statusEl.innerHTML = `<span style="color:${statusColor};font-weight:600">${res.status} ${res.statusText}</span> <span style="color:var(--text-secondary)">— ${elapsed}ms</span>`

    responseEl.style.display = 'block'
    responseEl.innerHTML = `
      <div style="padding:12px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
        <div style="display:flex;gap:8px;font-size:13px;margin-bottom:4px">
          ${methodBadge(method)} <code style="font-size:13px">${escapeHtml(finalPath)}</code>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">
          <span style="color:${statusColor};font-weight:600">${res.status} ${res.statusText}</span>
          <span style="margin-left:8px">${elapsed}ms</span>
        </div>
        ${bodyHtml}
      </div>
    `
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime)
    statusEl.innerHTML = `<span style="color:#EF4444;font-weight:600">Erreur</span> <span style="color:var(--text-secondary)">— ${elapsed}ms</span>`
    responseEl.style.display = 'block'
    responseEl.innerHTML = `
      <div style="padding:12px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">
        <div style="color:#EF4444;font-size:13px">✗ ${escapeHtml(err.message)}</div>
      </div>
    `
  }
}

export function initTester(container) {
  container.addEventListener('click', (e) => {
    const tryBtn = e.target.closest('.try-btn')
    if (tryBtn) {
      const endpointId = tryBtn.dataset.endpoint
      const panel = document.getElementById(`try-${endpointId}`)
      if (!panel) return
      const isVisible = panel.style.display !== 'none'
      panel.style.display = isVisible ? 'none' : 'block'
      if (!isVisible) {
        populateTryPanel(endpointId, panel)
      }
      e.preventDefault()
    }

    const sendBtn = e.target.closest('.send-btn')
    if (sendBtn) {
      const panel = sendBtn.closest('.try-panel')
      const card = panel?.closest('.endpoint-card')
      if (!card || !panel) return
      sendRequest(card, panel)
      e.preventDefault()
    }
  })
}

export function setOpenapiSpec(spec) {
  window._openapiSpec = spec
}

window.resetApiData = async function () {
  const { apiUrl } = getParams()
  try {
    const res = await fetch(apiUrl + '/_reset', { method: 'POST' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const statusEls = document.querySelectorAll('.try-status')
    statusEls.forEach(el => { el.textContent = '✓ Données réinitialisées' })
  } catch (err) {
    const statusEls = document.querySelectorAll('.try-status')
    statusEls.forEach(el => { el.textContent = '✗ ' + err.message })
  }
}
