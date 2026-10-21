/**
 * Forwards playable genlog / log_remote funnel events to GA4.
 *
 * Set GA_MEASUREMENT_ID to your GA4 ID (G-XXXXXXXX) before deploy.
 * Include this script AFTER js/code.js on each playable page.
 */
;(function () {
  var GA_MEASUREMENT_ID = 'G-40W6H7KQS2'

  if (window.__bdGaBridge) return
  window.__bdGaBridge = true

  function ensureGtag() {
    if (!GA_MEASUREMENT_ID) return false
    if (typeof window.gtag === 'function') return true

    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID)

    var script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID)
    document.head.appendChild(script)
    return true
  }

  function playableId() {
    return typeof window.ad_name === 'string' && window.ad_name ? window.ad_name : 'unknown'
  }

  function sendGa(eventName, detail) {
    if (!ensureGtag()) return
    window.gtag('event', String(eventName || 'playable_event'), {
      event_category: 'playable',
      playable_id: playableId(),
      detail: detail == null ? '' : String(detail),
    })
  }

  function wrap(name, mapArgs) {
    var original = window[name]
    if (typeof original !== 'function' || original.__bdGaWrapped) return

    function wrapped() {
      try {
        var mapped = mapArgs(arguments)
        if (mapped) sendGa(mapped.eventName, mapped.detail)
      } catch (err) {
        // Never block the playable if GA fails.
      }
      return original.apply(this, arguments)
    }

    wrapped.__bdGaWrapped = true
    window[name] = wrapped
  }

  wrap('genlog', function (args) {
    return {
      eventName: args[0],
      detail: args[1],
    }
  })

  wrap('log_remote', function (args) {
    return {
      eventName: 'playable_remote',
      detail: String(args[0] || '') + ':' + String(args[1] == null ? '' : args[1]),
    }
  })
})()
