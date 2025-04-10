import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function Home() {

    const [data, setData] = useState()
    console.log("🚀 ~ Home ~ data:", data)

    useEffect(() => {
        axios.get('http://localhost:3000/users')
       
        .then(json => setData(json?.data))    },[])

  return (
    <div>   
<input name="myInput" onChange={e =>console.log(e?.target.value)}/>
<div>{data?.data?.[0]?.id}</div>
<div className='text-[45px]'>
    test
</div>
    </div>
  )
}
