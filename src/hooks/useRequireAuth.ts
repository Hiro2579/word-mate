'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const useRequireAuth = () => {
  console.log('useRequireAuthが呼ばれました')

  const router = useRouter()

  useEffect(() => {
    console.log('useRequireAuthのuseEffect開始')

    const supabase = createClient()

    const check = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/auth')
      }
    }

    check()
  }, [router])
}