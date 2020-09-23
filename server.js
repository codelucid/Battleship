const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)



// Set Static Folder
app.use(express.static(path.join(__dirname, "public")))

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle a socket connection request from web client
// A "socket" is the actual client that is connecting
const connections = [null, null]

io.on('connection', socket => {
    console.log('New Web Socket Connection')

    // Find an available player number
    // We are going to loop through and i will be zero. 
    // If "connections[0]" equals "null," then "playerIndex" will equal zero
    // This means we have found a connection in the loop, so we "break" (we don't need another connection)
    // If "connections[i]" never equals "null," then "playerIndex" will remain at -1
    let playerIndex = -1;
    for (const i in connections) {
        if (connections[i] === null) {
            playerIndex = i
            break
        }
    }

    // Tell the connecting client what player number they are
    // "socket.emit" only communicates to the socket that connected
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    // Ignore player three
    if (playerIndex === -1) return

    connections[playerIndex] = false

    // Tell everyone what player number just connected
    // "socket.broadcast.emit" tells everybody else what you want to tell them
    // Send the topic/title of "player-connection" with the data of playerIndex
    socket.broadcast.emit('player-connection', playerIndex)

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected`)
        connections[playerIndex] = null
        // Tell everyone what player number disconnected
        socket.broadcast.emit('player-connection', playerIndex)
    })

    // On ready
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    // Check player connections
    // Loop through the connections
    // If connection is null, push into our players array- connection is false and ready is false
    // Otherwise, if not null and there is a connection, push into players array- connection is true and 
    // get ready status from actual connection  
    // Then, emit that back to the socket that asked for it 
    socket.on('check-players', () => {
        const players = []
        for (const i in connections) {
            connections[i] === null ? players.push({connected: false, ready: false}) : 
            players.push({connected: true, ready: connections[i]})
        }
        socket.emit('check-players', players)
    })

    // On fire received
    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id)

        // Emit the move to the other player
        socket.broadcast.emit('fire', id)
    })

    // On fire reply
    socket.on('fire-reply', square => {
        console.log(square)

        // Forward the reply to the other player
        socket.broadcast.emit('fire-reply', square)
    })

    // Timeout Connection
    // 10 minute limit per player
    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 600000) 
})
