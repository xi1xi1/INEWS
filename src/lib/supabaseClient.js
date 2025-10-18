import { createClient } from '@supabase/supabase-js'

// 使用 Vite 环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkwqnmsapvityfuwptvp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrd3FubXNhcHZpdHlmdXdwdHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDg5MjMsImV4cCI6MjA3NTkyNDkyM30.MROOVozPFgP2ZRRqqnh7Nh75z89Jy6R_Y14jLkFAlKc'

// 创建客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.warn('获取存储项失败:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn('设置存储项失败:', error)
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn('删除存储项失败:', error)
        }
      }
    }
  }
})