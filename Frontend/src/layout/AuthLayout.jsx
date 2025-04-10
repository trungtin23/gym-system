import React from 'react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className=''>
        <div>
            AuthLayout
        </div>
        <div>
            <Outlet/>
        </div>
    </div>
  )
}
