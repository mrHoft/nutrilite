<template>
  <div class="not-found">
    <p class="nf-code">404</p>
    <h1>Страница не найдена</h1>
    <p class="nf-lead">
      Возможно, модуль ещё не добавлен или ссылка устарела.
    </p>
    <a class="primary-button" href="#/">Вернуться к курсу</a>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 60vh;
  text-align: center;
}

.nf-code {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 700;
  line-height: 1;
  color: var(--green);
}

.not-found h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--ink);
}

.nf-lead {
  margin: 0 0 0.75rem;
  color: var(--muted);
}
</style>