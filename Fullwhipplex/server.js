const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_...'); // <-- сюда вставь свой Secret Key
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { quantity } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: 'Билет в кино',
            },
            unit_amount: 45000, // 450 руб = 45000 копеек
          },
          quantity: quantity,
        },
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
});

app.listen(3000, () => console.log('Сервер работает на http://localhost:3000'));
