const html = `<script>const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host)
  ws.onmessage = e => pre.textContent = e.data + '\\n' + pre.textContent</script>
  <input onkeyup="event.key=='Enter'&&ws.send(this.value)"><pre id=pre>`

const sockets = new Set()
const channel = new BroadcastChannel("")

channel.onmessage = e => {
  (e.target != channel) && channel.postMessage(e.data)
  sockets.forEach(s => s.send(e.data))
}

Deno.serve((r) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    sockets.add(socket)
    socket.onmessage = channel.onmessage
    socket.onclose = _ => sockets.delete(socket)
    return response
  } catch {
    return new Response(html, {headers: {'Content-type': 'text/html'}})
  }
})
