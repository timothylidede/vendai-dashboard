import './App.css';
import MainDash from './components/MainDash/MainDash';
import Sidebar from './components/Sidebar';
import OrdersDash from './components/OrdersDash/OrdersDash'; 
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
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
