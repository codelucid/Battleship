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
})
