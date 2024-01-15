import { Routes, Route } from 'react-router-dom';
import Lobby from './Screen/Lobby';
import SocketProvider from './Context/SocketProvider';
import Room from './Screen/Room';
const App = () => {
  return (
    <SocketProvider>
      <Routes>
        <Route path='/' element={<Lobby />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
    </SocketProvider>
  )
}

export default App