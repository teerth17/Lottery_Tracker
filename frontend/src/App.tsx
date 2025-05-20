import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/Signup'
import { Home } from './pages/Home'
import { NewTicket } from './pages/NewTicket'
import { ScanTicket } from './pages/ScanTicket'
import { AddNewTicket } from './pages/AddNewTicket'
import { AddScanTickets } from './pages/AddScanTickets'
import { GetScanTickets } from './pages/GetScanTickets'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <BrowserRouter>
        <Routes>
           <Route path='/signin' element={<SignIn />}></Route>
           <Route path='/signup' element={<SignUp />} ></Route> 
           <Route path='/user/home' element={<Home />} ></Route>
           <Route path='/user/newTicket' element={<NewTicket />} ></Route>
           <Route path='/user/newTicket/add' element={<AddNewTicket />} ></Route>
           
           <Route path='/user/scanTicket' element={<ScanTicket />}></Route>
           <Route path='/user/scanTicket/scan' element = {<AddScanTickets />}></Route>
           <Route path='/user/scanTicket/getAllScans' element={<GetScanTickets />}></Route>
        </Routes>
        </BrowserRouter>
        
      </div>
    </>
  )
}

export default App
