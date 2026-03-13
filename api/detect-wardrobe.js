const DAILY_LIMIT = 10;

const requestStore = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const today = new Date().toISOString().slice(0, 10);

  const entry = requestStore.get(ip);

  if (!entry || entry.date !== today) {
    requestStore.set(ip, { count: 1, date: today });
    return false;
  }

  if (entry.count >= DAILY_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}
