import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Tüm domainlerden gelen isteklere izin ver (Production'da sadece kendi siteni yazabilirsin)
app.use('*', cors())

app.get('/', (c) => {
  return c.text('HireMe Form Backend is running on Bun + Hono!')
})

app.post('/api/hire', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return c.json({ error: 'Lütfen tüm alanları doldurun' }, 400)
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY eksik!')
      return c.json({ error: 'Sunucu yapılandırma hatası (API Key eksik)' }, 500)
    }

    const receiverEmail = process.env.RECEIVER_EMAIL || 'erenboluk.dev@gmail.com'

    // Resend HTTP API üzerinden mail gönderme
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        // Resend'de domain onaylanana kadar gönderici adresi onboarding@resend.dev olmak zorundadır.
        from: 'Portfolio Form <onboarding@resend.dev>',
        to: receiverEmail,
        reply_to: email,
        subject: `Yeni İş Teklifi: ${name} (Portfolio)`,
        text: `İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Resend API Hatası:', errorData)
      throw new Error(errorData.message || 'Resend API error')
    }
    
    console.log('Email sent successfully via Resend');
    return c.json({ success: true, message: 'Mesaj başarıyla gönderildi' })
  } catch (error) {
    console.error('Email gönderim hatası:', error)
    return c.json({ error: 'Mesaj gönderilirken bir hata oluştu: ' + (error as Error).message }, 500)
  }
})

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
