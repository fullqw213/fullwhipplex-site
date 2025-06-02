const express = require('express');
const app = express();
const stripe = require('stripe')('sk_live_...'); // вставь свой Live secret key
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());

// Служит HTML-страницы из папки public
app.use(express.static(path.join(__dirname, 'public')));

app.post('/create-checkout-session', async (req, res) => {
  const { quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'rub',
          product_data: {
            name: 'Билет в кино',
          },
          unit_amount: 45000,
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: 'http://localhost:4242/success.html',
      cancel_url: 'http://localhost:4242/cancel.html',
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('Сервер запущен на порту 4242'));
