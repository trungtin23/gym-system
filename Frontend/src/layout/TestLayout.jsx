import React from 'react'
import { Outlet } from 'react-router-dom'

export default function TestLayout() {
  return (
    <div>
        đây là header
        <Outlet/>
    </div>
  )
}
