import { authHeader } from './authApi';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const handle = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unexpected response from server');
  }
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

export const getAllReviews = async () => {
  const res = await fetch(`${API_URL}/reviews`);
  return (await handle(res)).data;
};

export const getEligibleClaims = async () => {
  const res = await fetch(`${API_URL}/reviews/eligible`, {
    headers: { ...authHeader() },
  });
  return (await handle(res)).data;
};

export const submitReview = async ({ itemId, rating, story, timeToRecover }) => {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ itemId, rating, story, timeToRecover }),
  });
  return (await handle(res)).data;
};
