/**
 * AI Assistant API client.
 */
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const aiSearch = async (message, { signal } = {}) => {
  const response = await fetch(`${API_URL}/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Unexpected response from AI service');
  }
  if (!response.ok) {
    throw new Error(data?.message || 'AI search failed');
  }
  return data;
};
