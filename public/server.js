const express = require('express');
const fs = require('fs');
const stripe = require('stripe')('sk_test_ВАШ_СЕКРЕТНЫЙ_КЛЮЧ');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const seatsPath = './seatsData.json';

function loadSeats() {
  if (!fs.existsSync(seatsPath)) {
    fs.writeFileSync(seatsPath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(seatsPath));
}

function saveSeats(data) {
  fs.writeFileSync(seatsPath, JSON.stringify(data, null, 2));
}

app.get('/seats', (req, res) => {
  const { movie, time } = req.query;
  const data = loadSeats();
  const key = `${movie}_${time}`;
  res.json(data[key] || []);
});

app.post('/seats', (req, res) => {
  const { movie, time, selectedSeats } = req.body;
  const data = loadSeats();
  const key = `${movie}_${time}`;
  data[key] = Array.from(new Set([...(data[key] || []), ...selectedSeats]));
  saveSeats(data);
  res.json({ success: true });
});

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
          unit_amount: 45000, // 450.00 RUB
        },
        quantity,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000');
});
