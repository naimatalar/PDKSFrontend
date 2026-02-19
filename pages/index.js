
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Layout from '../layout/layout'
import PageHeader from '../layout/pageheader'



export default function Home() {
  const router = useRouter()
useEffect(()=>{

  router.push('/dashboard', undefined, { shallow: true })
  
},[])

  return <></>



}
