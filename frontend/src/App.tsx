import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/Signup'
import { Home } from './pages/Home'
import { NewTicket } from './pages/NewTicket'
import { ScanTicket } from './pages/ScanTicket'
import { AddNewTicket } from './pages/AddNewTicket'
import { AddScanTickets } from './pages/AddScanTickets'
import { GetScanTickets } from './pages/GetScanTickets'
import { SoldTicketsSummary } from './pages/SoldTicketsSummary'


function App() {
  return (
      <BrowserRouter>
        <div className="relative">
  
          <div className="min-h-screen">
            <Routes>
              <Route path='/signin' element={<SignIn />} />
              <Route path='/signup' element={<SignUp />} />
              <Route 
                path='/user/*' 
                element={
                    <Routes>
                      <Route path='home' element={<Home />} />
                      <Route path='newTicket' element={<NewTicket />} />
                      <Route path='newTicket/add' element={<AddNewTicket />} />
                      <Route path='scanTicket' element={<ScanTicket />} />
                      <Route path='scanTicket/scan' element={<AddScanTickets />} />
                      <Route path='scanTicket/getAllScans' element={<GetScanTickets />} />
                      <Route path='scanTicket/soldSummary' element={<SoldTicketsSummary />} />
                    </Routes>
                }
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
  )
}

export default App
