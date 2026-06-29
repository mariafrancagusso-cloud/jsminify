// pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Index() {
  const router = useRouter()
  useEffect(() => {
    fetch('/api/auth?action=me')
      .then(r => r.ok ? router.replace('/app') : router.replace('/login'))
  }, [])
  return null
}
