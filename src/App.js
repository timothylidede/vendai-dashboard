import './App.css';
import MainDash from './components/MainDash/MainDash';
import Sidebar from './components/Sidebar';
import OrdersDash from './components/OrdersDash/OrdersDash'; 
import AgentsDash from './components/AgentsDash/AgentsDash';
import CustomersDash from './components/CustomersDash/CustomersDash'; 
import SettingsDash from './components/SettingsDash/SettingsDash';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <div className="AppGlass">
        <Router>
          <Sidebar />
          <Routes>
            <Route path="/" element={<MainDash />} />
            <Route path="/orders" element={<OrdersDash />} />
            <Route path="/agents" element={<AgentsDash />} />
            <Route path="/customers" element={<CustomersDash />} />
            <Route path="/settings" element={<SettingsDash />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
