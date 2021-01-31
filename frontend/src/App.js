import './App.css';
import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import CoinsList from './components/coins-list.component'
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="container">
      <CoinsList/> 
    </div>
  );
}

export default App;
