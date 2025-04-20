import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const App = () => (
  <Router>
    <Navbar />
    <div className="pt-16"> {/* Add padding top to push content below fixed navbar */}
      <AppRoutes />
    </div>
  </Router>
);

export default App;