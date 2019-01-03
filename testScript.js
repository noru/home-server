(function() {

  let client = new WebSocket('ws://localhost:3000/paste')
  client.onerror = function(error) {
    console.error(error)
  }

  client.onmessage = function(evt) {
    console.info(evt.data)
  }

  client.onopen = function() {
    client.send('set::somestring')
  }

  window._wsClient = client
})()
