import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../Context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setremoteSocketId] = useState(null)
  const [MyStream, setMyStream] = useState(null)
  const [RemoteStream, setRemoteStream] = useState()

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(email, ' joined the room');
    setremoteSocketId(id)
  },
    [],
  )

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    const offer = await peer.getOffer();
    socket.emit('user:call', { to: remoteSocketId, offer })
    setMyStream(stream)
  },
    [remoteSocketId, socket],
  )

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setremoteSocketId(from)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    setMyStream(stream)
    const ans = await peer.getAnswer(offer);
    socket.emit('call:accepted', { to: from, ans })
  },
    [socket],
  )
  const sendStreams = useCallback(() => {
    for (const track of MyStream.getTracks()) {
      peer.peer.addTrack(track, MyStream)
    }
  }, [MyStream])

  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log('Call Accepted');
    sendStreams()
  },
    [sendStreams],
  )

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  },
    [remoteSocketId, socket]
  )

  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  },
    [],
  )





  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
    }
  }, [handleNegoNeeded])



  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0])
    })

    return () => {

    }
  }, [])

  const handleNegoIncoming = useCallback(async ({ from, offer }) => {
    const ans = await peer.getAnswer(offer);
    socket.emit('peer:nego:done', { to: from, ans })
  },
    [socket],
  )



  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming:call', handleIncomingCall)
    socket.on('call:accepted', handleCallAccepted)
    socket.on('peer:nego:needed', handleNegoIncoming)
    socket.on('peer:nego:final', handleNegoFinal)
    return () => {
      socket.off('user:joined', handleUserJoined)
      socket.off('incoming:call', handleIncomingCall)
      socket.off('call:accepted', handleCallAccepted)
      socket.off('peer:nego:needed', handleNegoIncoming)
      socket.off('peer:nego:final', handleNegoFinal)
    }
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoFinal])


  return (
    <div>
      <h1 style={{ fontSize: '3rem' }}>Room</h1>
      <h4 style={{ fontSize: '2rem' }}>
        {
          remoteSocketId ? 'Conneted' : 'No one is here'
        }
      </h4>
      {
        MyStream && <button onClick={sendStreams}>Send Stream</button>
      }
      <br />
      {
        remoteSocketId &&
        <button onClick={handleCallUser} style={{ fontSize: '2rem', background: 'green', color: 'white', padding: '1rem' }}>Call</button>
      }
      {
        MyStream &&
        <ReactPlayer playing muted url={MyStream} height="300px" width="600px" />
      }
      {
        RemoteStream &&
        <ReactPlayer playing muted url={RemoteStream} height="300px" width="600px" />
      }
    </div>
  )
}

export default Room