import { createHighlighter } from 'shiki'
import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'
import { mountOpenApiViewer } from './openapi-viewer.js'
import { runTests, abortTests } from './protask/api/tester.js'

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

async function fetchRawJs(path) {
  const res = await fetch(path + '?raw')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const text = await res.text()
  const prefix = 'export default '
  if (text.startsWith(prefix)) return JSON.parse(text.slice(prefix.length))
  return text
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

window.resetGuideIndex = function () {
  _guideIndex = 0
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
  const wrap = document.querySelector('.preview-frame-wrap')

  const isPreview = view === 'preview'
  iframe.style.display = isPreview ? 'block' : 'none'
  if (wrap) wrap.style.display = isPreview ? '' : 'none'
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

  if (view === 'tester') {
    content.style.display = 'block'
    document.getElementById('apiContainer').style.display = 'none'
    const defaultUrl = window.location.origin + '/api'
    content.innerHTML = `
      <div class="tester-container">
        <div class="tester-bar">
          <label>API Base URL</label>
          <input type="text" id="testerUrl" value="${defaultUrl}" class="tester-input" />
          <button class="view-btn" id="testerRunBtn" onclick="window._runTests()">Lancer les tests</button>
          <button class="view-btn" id="testerAbortBtn" style="display:none" onclick="window._abortTests()">Arrêter</button>
        </div>
        <div id="testerProgress" style="display:none;padding:12px 0">
          <div class="tester-progress-bar"><div class="tester-progress-fill" id="testerProgressFill"></div></div>
          <div style="margin-top:6px;font-size:13px;color:var(--text-secondary)" id="testerProgressText">Exécution…</div>
        </div>
        <div id="testerResults"></div>
      </div>
    `
    return
  }

  try {
    const url = fileUrl(view)
    if (!url) throw new Error('Aucun fichier sélectionné')
    let code
    if (view === 'apiclient') {
      code = await fetchRawJs(url)
    } else {
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      code = await res.text()
    }

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
      const p = window.currentProject
      const g = p?.guides?.[_guideIndex]
      if (g?.format === 'learning-path' && g?.manifest) {
        const mod = await import('/' + g.manifest)
        content.innerHTML = ''
        await renderLearningPath(mod.default)
        return
      }
      _guideSource = code
      showToggle('guideToggle', true)
      document.getElementById('guideToggle').textContent = 'Source'
      content.innerHTML = await renderMarkdown(_guideSource)
      await applyMermaid()
      const nav = document.getElementById('codeFileName')
      if (hasGuides()) {
        const btns = p.guides.map((_, i) =>
          `<button class="view-btn ${i === _guideIndex ? 'active' : ''}" onclick="window.switchGuideTo(${i})" style="margin-left:${i > 0 ? '4px' : '0'}">${p.guides[i].name}</button>`
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

window._runTests = async function () {
  const url = document.getElementById('testerUrl').value.trim()
  if (!url.startsWith('http')) {
    document.getElementById('testerResults').innerHTML = '<div style="color:#e06c75;padding:12px">URL invalide. L\'URL doit commencer par http:// ou https://</div>'
    return
  }
  const runBtn = document.getElementById('testerRunBtn')
  const abortBtn = document.getElementById('testerAbortBtn')
  const progress = document.getElementById('testerProgress')
  const fill = document.getElementById('testerProgressFill')
  const progressText = document.getElementById('testerProgressText')
  const results = document.getElementById('testerResults')

  runBtn.style.display = 'none'
  abortBtn.style.display = 'inline-block'
  progress.style.display = 'block'
  results.innerHTML = ''

  const t0 = performance.now()
  const result = await runTests(url)
  const elapsed = Math.round(performance.now() - t0)

  runBtn.style.display = 'inline-block'
  abortBtn.style.display = 'none'
  progress.style.display = 'none'

  let html = ''
  for (const cat of result.categories) {
    const passed = cat.tests.filter(t => t.status === 'pass').length
    const total = cat.tests.length
    const allPassed = passed === total
    html += `<details class="tester-category" ${allPassed ? '' : 'open'}>`
    html += `<summary class="tester-category-header ${allPassed ? 'pass' : 'fail'}">`
    html += `<span class="tester-status-icon">${allPassed ? '✅' : '❌'}</span>`
    html += `<span class="tester-category-name">${cat.name}</span>`
    html += `<span class="tester-category-count">${passed}/${total}</span>`
    html += `</summary>`
    html += `<div class="tester-test-list">`
    for (const test of cat.tests) {
      html += `<div class="tester-test ${test.status}">`
      html += `<span class="tester-status-icon">${test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️'}</span>`
      html += `<span class="tester-test-name">${test.name}</span>`
      html += `<span class="tester-test-duration">${test.duration}ms</span>`
      if (test.error) {
        html += `<div class="tester-test-error">`
        html += `<div>${test.error.message}</div>`
        if (test.error.expected || test.error.actual) {
          html += `<div style="margin-top:4px;display:flex;gap:12px;font-size:11px">`
          if (test.error.expected !== undefined && test.error.expected !== '') {
            html += `<span style="color:#22C55E">attendu: ${test.error.expected}</span>`
          }
          if (test.error.actual !== undefined && test.error.actual !== '') {
            html += `<span style="color:#e06c75">reçu: ${test.error.actual}</span>`
          }
          html += `</div>`
        }
        html += `</div>`
      }
      html += `</div>`
    }
    html += `</div>`
    html += `</details>`
  }

  const s = result.summary
  const allPass = s.failed === 0 && s.errors === 0
  html += `
    <div class="tester-summary ${allPass ? 'pass' : 'fail'}">
      <strong>${allPass ? '✅ Tous les tests passent' : '❌ Des tests ont échoué'}</strong><br>
      ${s.passed}/${s.total} réussis
      ${s.failed > 0 ? `, ${s.failed} échec(s)` : ''}
      ${s.errors > 0 ? `, ${s.errors} erreur(s)` : ''}
      — Durée : ${s.duration}ms (${elapsed}ms temps réel)
    </div>
  `

  results.innerHTML = html
}

window._abortTests = function () {
  abortTests()
  document.getElementById('testerAbortBtn').style.display = 'none'
}

let _currentLessonIndex = 0
let _learningManifest = null

async function renderLearningPath(manifest) {
  _learningManifest = manifest
  _currentLessonIndex = 0
  const content = document.getElementById('codeContent')
  content.innerHTML = ''
  showToggle('guideToggle', false)
  document.getElementById('apiContainer').style.display = 'none'
  content.style.display = 'block'
  renderLesson(0)
}

function renderLesson(index) {
  _currentLessonIndex = index
  const manifest = _learningManifest
  const lesson = manifest.lessons[index]
  if (!lesson) return

  const container = document.createElement('div')
  container.className = 'learning-path'

  const nav = document.createElement('div')
  nav.className = 'lp-nav'
  manifest.lessons.forEach((l, i) => {
    const btn = document.createElement('button')
    btn.className = 'lp-nav-btn' + (i === index ? ' active' : '')
    btn.textContent = (i + 1) + '. ' + l.title
    btn.onclick = () => renderLesson(i)
    nav.appendChild(btn)
  })
  container.appendChild(nav)

  const main = document.createElement('div')
  main.className = 'lp-main'

  const center = document.createElement('div')
  center.className = 'lp-center'
  center.innerHTML = `<div class="lp-lesson-header">
    <h2 class="lp-lesson-title">${lesson.title}</h2>
    <span class="lp-duration">${lesson.durationMinutes} min</span>
  </div>
  <p class="lp-summary">${lesson.summary}</p>
  <div class="lp-objective">
    <h3>Objectif</h3>
    <p>${lesson.summary}</p>
  </div>`

  const contentDiv = document.createElement('div')
  contentDiv.className = 'lp-content'
  center.appendChild(contentDiv)

  const lessonFile = lesson.file
  fetch('/' + lessonFile).then(r => r.text()).then(async mdText => {
    contentDiv.innerHTML = await renderMarkdown(mdText)
    if (lesson.quiz?.length) {
      const quizDiv = document.createElement('div')
      quizDiv.className = 'lp-quiz-section'
      lesson.quiz.forEach(q => quizDiv.appendChild(renderQuiz(q)))
      center.insertBefore(quizDiv, center.querySelector('.lp-check-section'))
    }
  })

  center.insertAdjacentHTML('beforeend', `<div class="lp-check-section">
    <label class="lp-url-label">API Base URL</label>
    <input type="text" class="tester-input lp-url-input" id="lpApiUrl" value="${window.location.origin}/api" />
    <button class="view-btn lp-check-btn" onclick="window._runLessonChecks()">${lesson.testCategories.length > 0 ? 'Vérifier mon étape' : 'Vérification disponible après la leçon 3'}</button>
  </div>`)

  main.appendChild(center)

  const sidebar = document.createElement('div')
  sidebar.className = 'lp-sidebar'
  const filesUpToHere = manifest.lessons.slice(0, index + 1).flatMap(l => l.files)
  const uniqueFiles = [...new Set(filesUpToHere)]
  sidebar.innerHTML = `<h3 class="lp-sidebar-title">Fichiers touchés</h3>
    <ul class="lp-file-list">
      ${uniqueFiles.map(f => `<li class="lp-file-item">${f}</li>`).join('')}
    </ul>
    <div class="lp-checkpoint-section">
      <h3>Code complet</h3>
      <details class="lp-checkpoint-details">
        <summary>Voir la solution complète</summary>
        ${manifest.lessons.slice(0, index + 1).map((l, i) => `
          <p><strong>Leçon ${i + 1} — ${l.title}</strong></p>
          <ul class="lp-file-list">
            ${l.files.map(f => `<li class="lp-file-item"><a href="/${l.checkpoint}${f}" target="_blank" class="lp-checkpoint-link">${f}</a></li>`).join('')}
          </ul>
          <p><a href="/${l.checkpoint}README.md" class="lp-checkpoint-link" target="_blank">📄 Lire le README du checkpoint →</a></p>
        `).join('')}
      </details>
    </div>`
  main.appendChild(sidebar)

  container.appendChild(main)
  const codeContent = document.getElementById('codeContent')
  codeContent.innerHTML = ''
  codeContent.appendChild(container)
}

window._runLessonChecks = async function () {
  const manifest = _learningManifest
  const lesson = manifest.lessons[_currentLessonIndex]
  if (!lesson || lesson.testCategories.length === 0) return

  const url = document.getElementById('lpApiUrl').value.trim()
  if (!url.startsWith('http')) return

  const checkBtn = document.querySelector('.lp-check-btn')
  checkBtn.textContent = 'Vérification en cours…'
  checkBtn.disabled = true

  const result = await runTests(url, lesson.testCategories)

  checkBtn.textContent = 'Vérifier mon étape'
  checkBtn.disabled = false

  let html = `<div class="lp-check-result"><p>Cette vérification couvre : ${lesson.testCategories.join(', ')}</p>`
  const allPassed = result.summary.failed === 0 && result.summary.errors === 0
  if (allPassed) {
    html += `<p class="lp-check-pass">✅ ${result.summary.passed}/${result.summary.total} tests réussis</p>`
  } else {
    html += `<p class="lp-check-fail">❌ ${result.summary.failed} test(s) échoué(s)</p>`
    html += `<p class="lp-check-hint">Relis l'étape « Vérifie maintenant » puis compare ton fichier avec le code complet.</p>`
  }
  html += '</div>'
  const existing = document.querySelector('.lp-check-result')
  if (existing) existing.remove()
  document.querySelector('.lp-check-section')?.insertAdjacentHTML('beforeend', html)
}

function renderQuiz(quiz) {
  const fieldset = document.createElement('fieldset')
  fieldset.className = 'lp-quiz'
  const legend = document.createElement('legend')
  legend.className = 'lp-quiz-legend'
  legend.textContent = quiz.question
  fieldset.appendChild(legend)

  const reveal = document.createElement('div')
  reveal.className = 'lp-quiz-reveal'
  reveal.setAttribute('role', 'status')
  reveal.style.display = 'none'

  quiz.choices.forEach((choice, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'lp-quiz-choice'
    btn.textContent = choice
    btn.setAttribute('aria-pressed', 'false')
    btn.onclick = () => {
      fieldset.querySelectorAll('.lp-quiz-choice').forEach(b => b.disabled = true)
      btn.setAttribute('aria-pressed', 'true')
      btn.classList.add(i === quiz.answer ? 'correct' : 'incorrect')
      const prefix = i === quiz.answer ? '✅ Bonne intuition — ' : 'ℹ️ Regarde cette explication — '
      const explanation = quiz.explanation || ''
      const answerText = i === quiz.answer ? '' : `\n(Réponse correcte : ${quiz.choices[quiz.answer]})`
      reveal.textContent = prefix + explanation + answerText
      reveal.style.display = 'block'
    }
    fieldset.appendChild(btn)
  })

  fieldset.appendChild(reveal)
  return fieldset
}
