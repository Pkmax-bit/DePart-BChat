import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function middleware(req) {
  const res = NextResponse.next()

  // Tạo Supabase client với cookies từ request
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return req.cookies.get(name)?.value
      },
      set(name, value, options) {
        res.cookies.set(name, value, options)
      },
      remove(name, options) {
        res.cookies.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })

  // Cho phép truy cập trang register mà không cần đăng nhập
  if (req.nextUrl.pathname === '/register') {
    return res
  }

  // Cho phép truy cập dashboard và admin với session tạm thời (cho User/Manager)
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin')) {
    // Kiểm tra Supabase session (cho Admin)
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Có Supabase session - là Admin
      if (req.nextUrl.pathname.startsWith('/admin')) {
        const adminEmails = ['backen@vanphuthanh.net']
        if (!adminEmails.includes(session.user.email)) {
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = '/dashboard'
          return NextResponse.redirect(redirectUrl)
        }
      }
      return res
    }

    // Không có Supabase session, kiểm tra localStorage session (cho User/Manager)
    // Note: Middleware không thể truy cập localStorage, nên tạm thời cho phép truy cập
    return res
  }

  // Cho các trang khác, chuyển hướng về login nếu chưa đăng nhập
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && req.nextUrl.pathname !== '/login') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Cấu hình để middleware chỉ chạy trên các trang cần bảo vệ
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/register',
  ],
}