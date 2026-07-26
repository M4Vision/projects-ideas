import { createHighlighter } from 'shiki'
import { marked } from 'marked'
import { mountOpenApiViewer } from './openapi-viewer.js'

let _highlighter = null
let _prdRendered = true
let _apiRendered = true
let _prdSource = ''
let _apiSpec = null
const LANG = { source: 'html', apiclient: 'javascript' }

async function getHL() {
  if (!_highlighter) {
    _highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: ['html', 'css', 'javascript', 'json', 'markdown'],
    })
  }
  return _highlighter
}

function fileLabel(view) {
  const p = window.currentProject
  const t = window.currentTheme
  if (!p) return ''
  if (view === 'prd') return p.name + ' — PRD'
  if (view === 'openapi') return p.name + ' — OpenAPI'
  if (view === 'apiclient') return p.name + ' — API Client'
  if (view === 'source' && t) return t.name + ' — ' + t.file
  return 'Source'
}

function fileUrl(view) {
  const p = window.currentProject
  const t = window.currentTheme
  if (view === 'source') return t?.file
  if (view === 'prd') return p?.docs
  if (view === 'openapi') return p?.openapi
  if (view === 'apiclient') return p?.demoApi
  return null
}

function showToggle(id, visible) {
  const btn = document.getElementById(id)
  if (btn) btn.style.display = visible ? 'inline-block' : 'none'
}

function hideAllToggles() {
  showToggle('prdToggle', false)
  showToggle('apiToggle', false)
  const w = document.getElementById('apiOptions')
  if (w) w.style.display = 'none'
}

window.togglePrdView = async function () {
  _prdRendered = !_prdRendered
  const content = document.getElementById('codeContent')
  const btn = document.getElementById('prdToggle')
  if (_prdRendered) {
    const body = _prdSource.replace(/^---[\s\S]*?---/, '').trim()
    content.innerHTML = '<div class="markdown-body">' + marked.parse(body) + '</div>'
    if (btn) btn.textContent = 'Source'
  } else {
    const hl = await getHL()
    content.innerHTML = hl.codeToHtml(_prdSource, { lang: 'markdown', theme: 'github-dark' })
    if (btn) btn.textContent = 'Rendu'
  }
}

window.toggleApiView = async function () {
  _apiRendered = !_apiRendered
  const content = document.getElementById('codeContent')
  const container = document.getElementById('apiContainer')
  const btn = document.getElementById('apiToggle')
  if (_apiRendered) {
    container.style.display = 'flex'
    content.style.display = 'none'
    if (btn) btn.textContent = 'Source'
  } else {
    container.style.display = 'none'
    content.style.display = 'block'
    const hl = await getHL()
    content.innerHTML = hl.codeToHtml(JSON.stringify(_apiSpec, null, 2), { lang: 'json', theme: 'github-dark' })
    if (btn) btn.textContent = 'Visuel'
  }
}

window.switchView = async function (view) {
  document.getElementById('apiContainer').style.display = 'none'
  document.getElementById('codeContent').style.display = 'block'
  hideAllToggles()

  const iframe = document.getElementById('previewFrame')
  const panel = document.getElementById('codePanel')
  const content = document.getElementById('codeContent')

  const isPreview = view === 'preview'
  iframe.style.display = isPreview ? 'block' : 'none'
  panel.classList.toggle('active', !isPreview)

  document.querySelectorAll('[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view)
  )

  if (isPreview) return

  document.getElementById('codeFileName').textContent = fileLabel(view)
  content.innerHTML = '<div style="color:#888;padding:20px">Charge…</div>'

  if (view === 'prd') {
    showToggle('prdToggle', true)
    _prdRendered = true
    document.getElementById('prdToggle').textContent = 'Source'
  } else if (view === 'openapi') {
    showToggle('apiToggle', true)
    _apiRendered = true
    document.getElementById('apiToggle').textContent = 'Source'
  }

  try {
    const url = fileUrl(view)
    if (!url) throw new Error('Aucun fichier sélectionné')
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const code = await res.text()

    if (view === 'prd') {
      _prdSource = code
      const body = code.replace(/^---[\s\S]*?---/, '').trim()
      content.innerHTML = '<div class="markdown-body">' + marked.parse(body) + '</div>'
    } else if (view === 'openapi') {
      _apiSpec = JSON.parse(code)
      _apiSpec.servers = [{ url: '' }]
      content.style.display = 'none'
      document.getElementById('apiContainer').style.display = 'flex'
      mountOpenApiViewer(_apiSpec)
    } else {
      const hl = await getHL()
      content.innerHTML = hl.codeToHtml(code, {
        lang: LANG[view] || 'text',
        theme: 'github-dark',
      })
    }
  } catch (e) {
    content.innerHTML =
      '<div style="color:#e06c75;padding:20px">Erreur\u00a0: ' + e.message + '</div>'
  }
}
