import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './page/Home'
import Login from './page/Login'
import AuthLayout from './layout/AuthLayout'
import TestLayout from './layout/TestLayout'
import Register from './page/Register'

export default function App() {
  return (
    <div>
      <Routes>
        <Route element={<AuthLayout/>} >
          <Route path='/' element={<Home/>}/>
        </Route>     
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
      </Routes>
    </div>
  )
}
