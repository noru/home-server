!function(){

  function $(id) {
    return document.getElementById(id)
  }

  function createWsClient() {
    let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return new WebSocket(protocol + '//' + window.location.host + '/ws/clipboard')
  }

  var msg = $('msg'),
      pastearea = $('paste-area'),
      clear = $('clear'),
      wsClient = createWsClient(),
      editing = false,
      timeoutId = null

  new ClipboardJS('#copy').on('success', function() {
    msg.style = "bottom: 0"
    setTimeout(function(){
      msg.style = undefined
    }, 2000);
  })

  wsClient.onerror = function(error) {
    console.error(error)
    wsClient = createWsClient()
  }
  wsClient.onmessage = function(evt) {
    pastearea.value = evt.data
  }

  wsClient.onopen = function() {
    wsClient.send('get')
  }
  pastearea.oninput = function(e) {
    editing = true
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      wsClient.send('set::' + e.target.value)
      timeoutId = null
      editing = false
    }, 1000);
  }

  clear.onclick = function() {
    pastearea.value = ''
    wsClient.send('set::')
  }

  setInterval(() => {
    !editing && wsClient.send('get')
  }, 1000);


}()