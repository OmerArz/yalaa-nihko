import { NextRequest } from 'next/server'
import webpush from 'web-push'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? ''
const vapidEmail = process.env.VAPID_EMAIL ?? 'mailto:admin@example.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, subscription, notification } = body

    if (action === 'subscribe') {
      return Response.json({ success: true, message: 'Subscription saved' })
    }

    if (action === 'send' && subscription) {
      if (!vapidPublicKey || !vapidPrivateKey) {
        return Response.json({ error: 'VAPID keys not configured' }, { status: 500 })
      }

      const payload = JSON.stringify(
        notification ?? {
          title: 'יַאלְלַה נִתְחַכּוּ 🌿',
          body: 'זמן לתרגל ערבית ירושלמית! יַלָּה, 5 דקות בלבד.',
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          url: '/chat',
        }
      )

      await webpush.sendNotification(subscription as webpush.PushSubscription, payload)
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Push error'
    console.error('Push API error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ publicKey: vapidPublicKey })
}
