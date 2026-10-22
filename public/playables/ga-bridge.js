/**
 * Playable analytics helpers:
 * 1) Mute legacy MoPub S3 impression beacons (safe to load before code.js)
 * 2) Forward genlog / log_remote to GA4 (load again after code.js)
 *
 * Events include playable_id (ad_name) so GA4 can break down by creative,
 * e.g. chocoborunner vs bb_tinyg vs bigbl_mysin.
 */
;(function () {
  var GA_MEASUREMENT_ID = 'G-40W6H7KQS2'

  muteS3ImpressionBeacons()
  wrapPlayableLogging()

  function muteS3ImpressionBeacons() {
    if (window.__bdS3Muted) return
    window.__bdS3Muted = true

    // doorman() sets new Image().src to this host — block it.
    var descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    if (descriptor && descriptor.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set: function (value) {
          if (typeof value === 'string' && value.indexOf('s3.amazonaws.com/impressions') !== -1) {
            return
          }
          return descriptor.set.call(this, value)
        },
      })
    }

    // Also no-op doorman if this file loads after code.js defines it.
    if (typeof window.doorman === 'function' && !window.doorman.__bdMuted) {
      window.doorman = function () {}
      window.doorman.__bdMuted = true
    }
  }

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

  function playableTitle() {
    return typeof window.ad_title === 'string' && window.ad_title ? window.ad_title : playableId()
  }

  function sendGa(eventName, detail) {
    if (!ensureGtag()) return
    // Custom params playable_id / playable_title let you segment each creative in GA4.
    window.gtag('event', String(eventName || 'playable_event'), {
      event_category: 'playable',
      playable_id: playableId(),
      playable_title: playableTitle(),
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

  function wrapPlayableLogging() {
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

    if (typeof window.doorman === 'function' && !window.doorman.__bdMuted) {
      window.doorman = function () {}
      window.doorman.__bdMuted = true
    }
  }
})()
