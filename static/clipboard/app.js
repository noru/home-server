!function(){

  function $(id) {
    return document.getElementById(id)
  }

  function createWsClient(pastearea, errorIcon) {
    let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    let newClient = new WebSocket(protocol + '//' + window.location.host + '/ws/clipboard')

    function showError(show) {
      errorIcon.className = show ? 'show' : ''
    }

    newClient.onerror = function(error) {
      console.error(error)
      showError(true)
    }

    newClient.onclose = function() {
      console.error('ws closed, why?')
      showError(true)
    }

    newClient.onmessage = function(evt) {
      showError(false)
      pastearea.value = evt.data
    }

    newClient.onopen = function() {
      showError(false)
      wsClient.send('get')
    }
    return newClient
  }

  var msg = $('msg'),
      pastearea = $('paste-area'),
      clear = $('clear'),
      paste = $('paste'),
      errorIcon = $('has-error'),
      wsClient = createWsClient(pastearea, errorIcon),
      editing = false,
      timeoutId = null

  new ClipboardJS('#copy').on('success', function() {
    msg.style = "bottom: 0"
    setTimeout(function(){
      msg.style = undefined
    }, 2000);
  })

  pastearea.oninput = function(e) {
    editing = true
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(function() {
      wsClient.send('set::' + e.target.value)
      timeoutId = null
      editing = false
    }, 1000);
  }

  clear.onclick = function() {
    pastearea.value = ''
    wsClient.send('set::')
  }

  paste.onclick = function() {
    if (navigator.clipboard) {
      editing = true
      navigator.clipboard.readText()
        .then(function(text) {
          if (!!pastearea.value) {
            pastearea.value += ('\n' + text)
          } else {
            pastearea.value = text
          }
          pastearea.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }))
        })
    } else {
      alert('This browser does not support this feature')
    }
  }

  var syncedAt = new Date,
      deamonAt = new Date

  function daemon() {
    let now = new Date
    function syncContent() {
      if (now - syncedAt > 2000) {
        !editing && wsClient.send('get')
        syncedAt = now
      }
    }

    function ensureConnection() {
      if (now - deamonAt > 5000) {
        if (wsClient.readyState > 1) {
          wsClient = createWsClient(pastearea, errorIcon)
        }
        deamonAt = now
      }
    }

    [syncContent, ensureConnection].forEach(function(func) {
      try {
        func()
      } catch (e) {
        console.error(e)
      }
    })

    requestAnimationFrame(daemon)
  }
  requestAnimationFrame(daemon)
}()