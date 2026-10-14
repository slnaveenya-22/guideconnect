export function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12)  return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

export function getGreetingEmoji(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12)  return '☀️';
  if (hour >= 12 && hour < 17) return '🌤️';
  if (hour >= 17 && hour < 21) return '🌆';
  return '🌙';
}