import { Hono } from 'hono'
import { cors } from 'hono/cors'
import * as nodemailer from 'nodemailer'

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

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Kendi e-posta servisini yazabilirsin, Gmail için App Password gerekir
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `Yeni İş Teklifi: ${name} (Portfolio)`,
      text: `İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`,
    }

    await transporter.sendMail(mailOptions)
    
    return c.json({ success: true, message: 'Mesaj başarıyla gönderildi' })
  } catch (error) {
    console.error('Email gönderim hatası:', error)
    return c.json({ error: 'Mesaj gönderilirken bir hata oluştu' }, 500)
  }
})

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
