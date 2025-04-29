import React from 'react';
import './App.css';
import {Login} from "./components/Login";
import { Register } from './components/Register';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import { Nav } from './components/Nav';
import { Home } from './components/Home';
import './interceptors/axios';
import { Forgot } from './components/Forgot';
import { Reset } from './components/Reset';
import { AddJob } from './components/JobAdd';
import { JobList } from './components/JobList';

function App() {
  return <BrowserRouter>
  <Nav/>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/forgot' element={<Forgot/>} />
      <Route path='/reset/:token' element={<Reset/>} />
      <Route path="/add-job" element={<AddJob />} />
      <Route path="/jobs" element={<JobList />} />

    </Routes>
  </BrowserRouter>
}

export default App;
