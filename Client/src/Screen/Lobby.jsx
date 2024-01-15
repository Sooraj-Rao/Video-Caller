import { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../Context/SocketProvider'
import { useNavigate } from 'react-router-dom'

const Lobby = () => {
    const navigate = useNavigate()
    const socket = useSocket();

    const [Input, setInput] = useState({
        email: '',
        room: ''
    })

    const handleChange = (e) => {
        setInput({ ...Input, [e.target.name]: e.target.value })
    }

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        socket.emit("room:join", Input)
    },
        [Input, socket]
    )

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        navigate('/room/'+ room)
    },
        [navigate],
    )


    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join')
        }
    }, [socket])


    return (
        <div style={{ margin: '10rem' }}>
            <form onSubmit={handleSubmit} >
                <label>Email ID</label>
                <input type="text" name='email' value={Input.email} onChange={handleChange} /><br /><br />
                <label>Room No.</label>
                <input type="text" name='room' value={Input.room} onChange={handleChange} /><br /><br />
                <button>Join</button>
            </form>
        </div>
    )
}

export default Lobby