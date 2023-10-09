const app_id = "7d2f9918909644828fa0f4a7764a9e8a"
const token = "007eJxTYPix+lfn+U0NDUWedk45Nar39kQ+u3/n0iKTJeozmpsnWE5XYDBPMUqztDS0sDSwNDMxsTCySEs0SDNJNDc3M0m0TLVIFM1VSW0IZGS45fKahZEBAkF8FobcxMw8BgYA83Ug8A=="
const chanel = "main"

//interface provide users voices,videos..

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined)

    client.on('user-left', handleUserLeft)

    // check id

    let ID = await client.join(app_id, chanel, token, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    //display stream

    let player = `<div class="video-container" id="user-container-${ID}">
                        <div class="video-player" id="user-${ID}"></div>
                </div>`

    //push stream container in HTML

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${ID}`)
    //Take src of videos and voices let users meet each  other
    //index 0 for voices and index 1 for videos
    await client.publish([localTracks[0], localTracks[1]])
}

//join stream

let joinStream = async () => {

    await joinAndDisplayLocalStream()
    // hidden btn join when join stream and edit controls btn
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

//join Remote Users

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}

// when leave stream remove it from html

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}
//leave and return at any time wit one click

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}
// mic on & off
let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    } else {
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}
// camera on & off
let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    } else {
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)