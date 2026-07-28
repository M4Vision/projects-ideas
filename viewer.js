import { createHighlighter } from 'shiki'
import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'
import { mountOpenApiViewer } from './openapi-viewer.js'

mermaid.initialize({ startOnLoad: false, theme: 'dark' })

let _highlighter = null
let _hlReady = false
let _hlLangs = []

const HIGHLIGHT_LANGS = [
  'html', 'css', 'javascript', 'typescript', 'json', 'markdown',
  'bash', 'shell', 'sql', 'yaml', 'xml', 'diff', 'php',
]

async function ensureHL() {
  if (!_highlighter) {
    _highlighter = await createHighlighter({
      themes: ['github-dark'],
      langs: HIGHLIGHT_LANGS,
    })
    _hlLangs = _highlighter.getLoadedLanguages()
    _hlReady = true
  }
  return _highlighter
}

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: true,
})

const defaultFence = md.renderer.rules.fence
md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx]
  const info = token.info.trim()
  if (info === 'mermaid') {
    return `<div class="mermaid">${token.content}</div>\n`
  }
  if (_hlReady && info && _hlLangs.includes(info)) {
    return _highlighter.codeToHtml(token.content, { lang: info, theme: 'github-dark' }) + '\n'
  }
  return defaultFence(tokens, idx, options, env, slf)
}

let _prdRendered = true
let _apiRendered = true
let _guideRendered = true
let _prdSource = ''
let _apiSpec = null
let _guideSource = ''
let _guideIndex = 0
const LANG = { source: 'html', apiclient: 'javascript', guide: 'markdown' }

async function renderMarkdown(src) {
  await ensureHL()
  const body = src.replace(/^---[\s\S]*?---/, '').trim()
  return '<div class="markdown-body">' + md.render(body) + '</div>'
}

async function applyMermaid() {
  const els = document.querySelectorAll('.mermaid')
  if (els.length > 0) {
    try { await mermaid.run({ querySelector: '.mermaid' }) } catch {}
  }
}

async function getHL() {
  return ensureHL()
}

function fileLabel(view) {
  const p = window.currentProject
  const t = window.currentTheme
  if (!p) return ''
  if (view === 'prd') return p.name + ' — PRD'
  if (view === 'openapi') return p.name + ' — OpenAPI'
  if (view === 'apiclient') return p.name + ' — API Client'
  if (view === 'guide' && p.guides?.[_guideIndex]) return p.name + ' — Guide : ' + p.guides[_guideIndex].name
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
  if (view === 'guide') return p?.guides?.[_guideIndex]?.file
  return null
}

function hasGuides() {
  const p = window.currentProject
  return p?.guides && p.guides.length > 0
}

window.switchGuide = async function (dir) {
  const p = window.currentProject
  if (!hasGuides()) return
  _guideIndex = (_guideIndex + dir + p.guides.length) % p.guides.length
  await window.switchView('guide')
}

window.switchGuideTo = async function (index) {
  _guideIndex = index
  await window.switchView('guide')
}

function showToggle(id, visible) {
  const btn = document.getElementById(id)
  if (btn) btn.style.display = visible ? 'inline-block' : 'none'
}

function hideAllToggles() {
  showToggle('prdToggle', false)
  showToggle('apiToggle', false)
  showToggle('guideToggle', false)
  const w = document.getElementById('apiOptions')
  if (w) w.style.display = 'none'
}

window.togglePrdView = async function () {
  _prdRendered = !_prdRendered
  const content = document.getElementById('codeContent')
  const btn = document.getElementById('prdToggle')
  if (_prdRendered) {
    content.innerHTML = await renderMarkdown(_prdSource)
    await applyMermaid()
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

window.toggleGuideView = async function () {
  _guideRendered = !_guideRendered
  const content = document.getElementById('codeContent')
  const btn = document.getElementById('guideToggle')
  if (_guideRendered) {
    content.innerHTML = await renderMarkdown(_guideSource)
    await applyMermaid()
    if (btn) btn.textContent = 'Source'
  } else {
    const hl = await getHL()
    content.innerHTML = hl.codeToHtml(_guideSource, { lang: 'markdown', theme: 'github-dark' })
    if (btn) btn.textContent = 'Rendu'
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
  } else if (view === 'guide') {
    showToggle('guideToggle', hasGuides())
    _guideRendered = true
    document.getElementById('guideToggle').textContent = 'Source'
  }

  try {
    const url = fileUrl(view)
    if (!url) throw new Error('Aucun fichier sélectionné')
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const code = await res.text()

    if (view === 'prd') {
      _prdSource = code
      content.innerHTML = await renderMarkdown(_prdSource)
      await applyMermaid()
    } else if (view === 'openapi') {
      _apiSpec = JSON.parse(code)
      _apiSpec.servers = [{ url: '' }]
      content.style.display = 'none'
      document.getElementById('apiContainer').style.display = 'flex'
      mountOpenApiViewer(_apiSpec)
    } else if (view === 'guide') {
      _guideSource = code
      showToggle('guideToggle', true)
      document.getElementById('guideToggle').textContent = 'Source'
      content.innerHTML = await renderMarkdown(_guideSource)
      await applyMermaid()
      const nav = document.getElementById('codeFileName')
      if (hasGuides()) {
        const p = window.currentProject
        const g = p.guides
        const btns = g.map((_, i) =>
          `<button class="view-btn ${i === _guideIndex ? 'active' : ''}" onclick="window.switchGuideTo(${i})" style="margin-left:${i > 0 ? '4px' : '0'}">${g[i].name}</button>`
        ).join('')
        nav.innerHTML = p.name + ' — Guide <span style="color:var(--text-secondary);font-weight:400">' + btns + '</span>'
      }
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
