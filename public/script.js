// script.js

// Замените на свой публичный ключ Stripe (начинается с pk_test_)
const stripe = Stripe('pk_test_51RVHD4R2dSJPPzotmjWMQZ9nnNP3XS8O9pOp4dfNNSl5e5UPai0ZsmK62p41U29yRXLiWRGyXAhUPKBkJ9e2eTBI00797rwjMe');

document.getElementById('buy-button').addEventListener('click', async () => {
  const quantity = Number(document.getElementById('ticket-quantity').value);
  const movie = document.getElementById('movie-select').value;

  // Отправляем POST-запрос на сервер для создания Checkout-сессии
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, movie })
  });

  const data = await response.json();

  if (data.url) {
    // Перенаправляем пользователя на Stripe Checkout
    window.location.href = data.url;
  } else {
    alert('Ошибка при создании платежа');
  }
});

