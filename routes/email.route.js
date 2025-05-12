import express from 'express';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await sendEmail({
        to: '',      
        from: 'giovanni.dellelenti@gmail.com',
        subject: 'Test SendGrid da backend',
        text: 'Questo è un test vero e proprio!',
        html: '<strong>Arrivata davvero</strong>',
      });

    res.status(200).json({ message: 'Email inviata!' });
  } catch (error) {
    res.status(500).json({ message: 'Errore invio email', error });
  }
});

export default router;
