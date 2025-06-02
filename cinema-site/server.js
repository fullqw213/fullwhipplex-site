const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const stripe = require('stripe')('ТВОЙ_СЕКРЕТНЫЙ_КЛЮЧ_STRIPE');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Читаем текущие занятые места
function getSeats() {
  if (!fs.existsSync('seats.json')) return {};
  return JSON.parse(fs.readFileSync('seats.json', 'utf8'));
}

// Сохраняем занятые места
function saveSeats(data) {
  fs.writeFileSync('seats.json', JSON.stringify(data, null, 2));
}

// Получить занятые места по фильму и времени
app.get('/seats', (req, res) => {
  const { movie, time } = req.query;
  const data = getSeats();
  const key = `${movie}_${time}`;
  res.json(data[key] || []);
});

// Сохранить новые занятые места
app.post('/seats', (req, res) => {
  const { movie, time, seats } = req.body;
  const data = getSeats();
  const key = `${movie}_${time}`;
  data[key] = [...(data[key] || []), ...seats];
  saveSeats(data);
  res.json({ success: true });
});

// Stripe checkout session
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
            unit_amount: 45000, // 450 рублей в копейках
          },
          quantity,
        },
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка при создании сессии' });
  }
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
