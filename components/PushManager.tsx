'use client'

import { useState, useEffect } from 'react'

export default function PushManager() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'granted' | 'default'>('loading')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
    } else {
      setStatus(Notification.permission as typeof status)
    }
  }, [])

  async function subscribe() {
    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      setStatus(permission as typeof status)

      if (permission !== 'granted') return

      const registration = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', subscription: sub.toJSON() }),
      })
    } catch (e) {
      console.error('Push subscription failed:', e)
    } finally {
      setSubscribing(false)
    }
  }

  function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = window.atob(base64)
    const arr = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
    return arr.buffer
  }

  if (status === 'loading') return null
  if (status === 'unsupported') {
    return (
      <div className="text-sm text-gray-400 p-3 bg-gray-50 rounded-xl">
        התראות לא נתמכות בדפדפן זה
      </div>
    )
  }
  if (status === 'granted') {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
        <span>✅</span>
        <span className="text-sm text-green-700 font-medium">התראות יומיות מופעלות</span>
      </div>
    )
  }
  if (status === 'denied') {
    return (
      <div className="text-sm text-red-600 p-3 bg-red-50 rounded-xl">
        הרשאת התראות נדחתה. אפשר בהגדרות הדפדפן.
      </div>
    )
  }

  return (
    <button
      onClick={subscribe}
      disabled={subscribing}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      <span>🔔</span>
      <span>{subscribing ? 'מפעיל...' : 'הפעל תזכורות יומיות'}</span>
    </button>
  )
}
