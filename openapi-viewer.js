import { initTester, setOpenapiSpec } from './openapi-tester.js'

const METHOD_COLORS = {
  get: '#22C55E', post: '#3B82F6', put: '#F59E0B', patch: '#F59E0B', delete: '#EF4444',
}

let _spec = null
let _selectedPath = null

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function methodBadge(method) {
  const c = METHOD_COLORS[method] || '#888'
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;background:${c}22;color:${c}">${method}</span>`
}

function renderSchema(schema, depth) {
  if (!schema) return '<span style="color:var(--text-secondary)">—</span>'
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()
    return `<a href="#" onclick="window.selectSchema('${name}');return false" style="color:var(--accent)">${name}</a>`
  }
  if (schema.type === 'array' && schema.items) {
    return `Array&lt;${renderSchema(schema.items, depth)}&gt;`
  }
  if (schema.enum) {
    return `enum: ${schema.enum.map(e => `<code>${escapeHtml(e)}</code>`).join(', ')}`
  }
  if (schema.type === 'object' || schema.properties) {
    if (depth > 0) return `<span style="color:var(--text-secondary)">object</span>`
    const props = Object.entries(schema.properties || {}).map(([k, v]) => {
      const required = schema.required?.includes(k) ? '<span style="color:var(--accent)">*</span>' : ''
      return `<tr><td style="padding:4px 8px;border-bottom:1px solid var(--border);white-space:nowrap">${escapeHtml(k)}${required}</td><td style="padding:4px 8px;border-bottom:1px solid var(--border)">${renderSchema(v, depth + 1)}</td><td style="padding:4px 8px;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:12px">${escapeHtml(v.description || '')}</td></tr>`
    }).join('')
    return `<table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${props}</tbody></table>`
  }
  return `<code style="color:var(--text-secondary)">${escapeHtml(schema.type || 'any')}</code>`
}

function renderParams(params) {
  if (!params || params.length === 0) return ''
  const rows = params.map(p =>
    `<tr><td style="padding:4px 8px;border-bottom:1px solid var(--border);white-space:nowrap">${escapeHtml(p.name)} ${p.required ? '<span style="color:var(--accent)">*</span>' : ''}</td><td style="padding:4px 8px;border-bottom:1px solid var(--border)"><code style="font-size:12px">${escapeHtml(p.in)}</code></td><td style="padding:4px 8px;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:12px">${escapeHtml(p.description || '')}</td></tr>`
  ).join('')
  return `<div style="margin:4px 0 12px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--text-secondary);font-size:11px;text-transform:uppercase"><th style="padding:4px 8px;border-bottom:2px solid var(--border);text-align:left">Paramètre</th><th style="padding:4px 8px;border-bottom:2px solid var(--border);text-align:left">Type</th><th style="padding:4px 8px;border-bottom:2px solid var(--border);text-align:left">Description</th></tr></thead><tbody>${rows}</tbody></table></div>`
}

function renderResponses(responses) {
  if (!responses) return ''
  const rows = Object.entries(responses).map(([code, resp]) => {
    const hasBody = resp.content?.['application/json']?.schema
    const desc = escapeHtml(resp.description || '')
    const body = hasBody ? renderSchema(resp.content['application/json'].schema, 0) : ''
    return `<tr><td style="padding:4px 8px;border-bottom:1px solid var(--border);white-space:nowrap"><code style="font-weight:600">${escapeHtml(code)}</code></td><td style="padding:4px 8px;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:13px">${desc}</td><td style="padding:4px 8px;border-bottom:1px solid var(--border);font-size:13px">${body}</td></tr>`
  }).join('')
  return `<div style="margin:4px 0 12px"><div style="color:var(--text-secondary);font-size:11px;text-transform:uppercase;margin-bottom:4px">Réponses</div><table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${rows}</tbody></table></div>`
}

function renderEndpoint(path, methods) {
  return Object.entries(methods).map(([method, op]) => {
    const safePath = path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]/gi, '-')
    const id = `endpoint-${method}-${safePath}`
    const summary = escapeHtml(op.summary || '')
    const desc = op.description ? `<p style="color:var(--text-secondary);font-size:13px;margin:4px 0 8px">${escapeHtml(op.description)}</p>` : ''
    const params = renderParams(op.parameters)
    const bodySchema = op.requestBody?.content?.['application/json']?.schema
    const body = bodySchema
      ? `<div style="margin:4px 0 8px"><div style="color:var(--text-secondary);font-size:11px;text-transform:uppercase;margin-bottom:4px">Request Body</div>${renderSchema(bodySchema, 0)}</div>`
      : ''
    const responses = renderResponses(op.responses)
    return `<div id="${id}" class="endpoint-card" data-endpoint="${method}-${safePath}" data-path="${escapeHtml(path)}" data-method="${method}" style="margin:0 0 16px;background:var(--card);border-radius:var(--radius);padding:12px;border:1px solid var(--border)">${methodBadge(method)} <code style="font-size:14px;margin-left:8px">${escapeHtml(path)}</code><div style="font-weight:600;font-size:14px;margin:6px 0">${summary}</div>${desc}${params}${body}${responses}<div style="margin-top:8px;display:flex;gap:4px"><button class="try-btn" data-endpoint="${method}-${safePath}" style="padding:4px 12px;font-size:12px;border:1px solid var(--accent);border-radius:4px;background:var(--accent);color:#fff;cursor:pointer">▶ Try it</button></div><div class="try-panel" id="try-${method}-${safePath}" style="display:none;margin-top:8px;border-top:1px solid var(--border);padding-top:12px"></div></div>`
  }).join('')
}

function renderTagGroup(tag, paths) {
  const endpoints = Object.entries(paths).filter(([_, methods]) =>
    Object.values(methods).some(op => op.tags?.includes(tag))
  )
  if (endpoints.length === 0) return ''
  const name = escapeHtml(tag)
  const content = endpoints.map(([path, methods]) => renderEndpoint(path, methods)).join('\n')
  return `<div style="margin:0 0 24px"><h3 style="font-size:16px;font-weight:600;margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border)">${name}</h3>${content}</div>`
}

function renderSidebar(tags, paths) {
  return tags.map(tag => {
    const endpoints = Object.entries(paths).filter(([_, methods]) =>
      Object.values(methods).some(op => op.tags?.includes(tag))
    )
    if (endpoints.length === 0) return ''
    const items = endpoints.map(([path, methods]) => {
      const method = Object.keys(methods)[0]
      const op = methods[method]
      const id = `endpoint-${method}-${path.replace(/[^a-z0-9]/gi, '-')}`
      return `<a href="#${id}" style="display:block;padding:3px 8px;font-size:12px;color:var(--text-secondary);text-decoration:none;border-radius:4px" onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background=''"><span style="display:inline-block;width:4ch;font-weight:700;text-transform:uppercase;color:${METHOD_COLORS[method] || '#888'}">${method}</span><span>${path.length > 35 ? path.slice(0, 32) + '…' : path}</span></a>`
    }).join('')
    return `<div style="margin:0 0 8px"><div style="font-size:13px;font-weight:600;padding:4px 8px;color:var(--fg)">${escapeHtml(tag)}</div>${items}</div>`
  }).join('')
}

window.selectSchema = function (name) {
  const def = _spec?.components?.schemas?.[name]
  if (!def) return
  // For now just scroll to the schema section
  const el = document.getElementById('schemas-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export function setServerUrl(url) {
  if (!_spec) return
  _spec.servers = [{ url }]
  const el = document.getElementById('apiServerDisplay')
  if (el) el.textContent = url
  const el2 = document.getElementById('apiServerSidebar')
  if (el2) el2.textContent = url
}
window.setServerUrl = setServerUrl

export function mountOpenApiViewer(spec) {
  _spec = spec
  const container = document.getElementById('apiContainer')
  const content = document.getElementById('codeContent')
  const urlInput = document.getElementById('apiUrlInput')
  const apiOptions = document.getElementById('apiOptions')

  content.style.display = 'none'
  container.style.display = 'flex'

  const tags = spec.tags?.map(t => t.name) || []
  // If no tags, extract from paths
  if (tags.length === 0) {
    const tagSet = new Set()
    Object.values(spec.paths).forEach(methods =>
      Object.values(methods).forEach(op => op.tags?.forEach(t => tagSet.add(t)))
    )
    tags.push(...tagSet)
  }

  const defaultUrl = spec.servers?.[0]?.url || '/api'
  if (urlInput) {
    urlInput.value = defaultUrl
    urlInput.oninput = () => setServerUrl(urlInput.value)
  }
  if (apiOptions) apiOptions.style.display = 'flex'

  const tokenInput = document.getElementById('apiTokenInput')
  if (tokenInput && !tokenInput.value) tokenInput.value = 'token-1'

  const sidebarHtml = renderSidebar(tags, spec.paths)
  const info = spec.info || {}
  const mainHtml = tags.map(tag => renderTagGroup(tag, spec.paths)).join('\n')

  // Schemas section
  let schemasHtml = ''
  if (spec.components?.schemas) {
    schemasHtml = '<div id="schemas-section" style="margin:24px 0 0"><h3 style="font-size:16px;font-weight:600;margin:0 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border)">Models</h3>'
    Object.entries(spec.components.schemas).forEach(([name, schema]) => {
      schemasHtml += `<div style="margin:0 0 12px;background:var(--card);border-radius:var(--radius);padding:12px;border:1px solid var(--border)"><div style="font-weight:600;font-size:14px;margin-bottom:6px">${escapeHtml(name)}</div>${renderSchema(schema, 0)}</div>`
    })
    schemasHtml += '</div>'
  }

  container.innerHTML = `
    <div style="display:flex;height:100%;font-size:14px;color:var(--fg)">
      <aside style="width:220px;overflow-y:auto;border-right:1px solid var(--border);padding:12px;flex-shrink:0;background:var(--bg)">
        <div style="font-size:13px;font-weight:600;margin-bottom:4px;padding:4px 8px">${escapeHtml(info.title || 'API')}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:12px;padding:0 8px" id="apiServerSidebar">${escapeHtml(defaultUrl)}</div>
        ${sidebarHtml}
      </aside>
      <main style="flex:1;overflow-y:auto;padding:16px">
        <div style="margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 4px">${escapeHtml(info.title || 'API')}</h1>
          <div style="color:var(--text-secondary);font-size:13px;line-height:1.6">${info.description ? escapeHtml(info.description) : ''}</div>
          ${defaultUrl ? `<div style="margin-top:8px;font-size:12px;color:var(--text-secondary)">Server: <code id="apiServerDisplay" style="background:var(--card);padding:2px 6px;border-radius:4px">${escapeHtml(defaultUrl)}</code></div>` : ''}
        </div>
        ${mainHtml}
        ${schemasHtml}
      </main>
    </div>
  `

  setOpenapiSpec(spec)
  initTester(container)
}
