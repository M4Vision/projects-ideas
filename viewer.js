import { createHighlighter } from 'shiki'

let _highlighter = null
const LANG = { source: 'html', prd: 'markdown', openapi: 'json', apiclient: 'javascript' }

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

window.switchView = async function (view) {
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

  try {
    const url = fileUrl(view)
    if (!url) throw new Error('Aucun fichier sélectionné')
    const res = await fetch(url)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const code = await res.text()
    const hl = await getHL()
    content.innerHTML = hl.codeToHtml(code, {
      lang: LANG[view] || 'text',
      theme: 'github-dark',
    })
  } catch (e) {
    content.innerHTML =
      '<div style="color:#e06c75;padding:20px">Erreur\u00a0: ' + e.message + '</div>'
  }
}
