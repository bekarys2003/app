import React from 'react';
import './App.css';
import {Login} from "./components/Login";
import { Register } from './components/Register';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import { Nav } from './components/Nav';
import { Home } from './components/Home';
import './interceptors/axios';

function App() {
  return <BrowserRouter>
  <Nav/>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
    </Routes>
  </BrowserRouter>
}

export default App;
