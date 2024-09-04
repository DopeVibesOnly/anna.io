const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
let players = {};
const playerId = Math.random().toString(36).substr(2, 9);
let position = {x: 400, y: 300};

const startButton = document.getElementById('startConnection');
const connectButton = document.getElementById('connectToPeer');
const remoteIdInput = document.getElementById('remoteId');

let peerConnection;
let dataChannel;

function drawPlayers() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        const player = players[id];
        context.fillStyle = 'blue';
        context.fillRect(player.x, player.y, 20, 20);
    }
}

function setupDataChannel(channel) {
    channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        players[data.id] = data.position;
        drawPlayers();
    };

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w':
                position.y -= 5;
                break;
            case 's':
                position.y += 5;
                break;
            case 'a':
                position.x -= 5;
                break;
            case 'd':
                position.x += 5;
                break;
        }
        players[playerId] = position;
        channel.send(JSON.stringify({ id: playerId, position }));
        drawPlayers();
    });
}

startButton.addEventListener('click', async () => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(configuration);

    dataChannel = peerConnection.createDataChannel("game");
    setupDataChannel(dataChannel);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("Send this to your peer:", JSON.stringify(peerConnection.localDescription));
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
});

connectButton.addEventListener('click', async () => {
    const remoteDescription = new RTCSessionDescription(JSON.parse(remoteIdInput.value));
    await peerConnection.setRemoteDescription(remoteDescription);

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(dataChannel);
    };

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("Send this to your peer:", JSON.stringify(peerConnection.localDescription));
});
