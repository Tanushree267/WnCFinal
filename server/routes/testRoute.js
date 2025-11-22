import transporter from './utils/email.js' // or wherever you defined it

async function testMail() {
  try {
    const info = await transporter.sendMail({
      from: `"WnC Cinema" <${process.env.SMTP_USER}>`,
      to: 'your_other_email@gmail.com',
      subject: 'Test email',
      text: 'If you see this, Nodemailer + Gmail works ✅',
    })
    console.log('Email sent:', info.messageId)
  } catch (error) {
    console.error('Email error:', error)
  }
}

testMail()