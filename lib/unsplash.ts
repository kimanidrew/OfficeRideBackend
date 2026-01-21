// src/lib/unsplash.ts
export async function getRandomPhoto(query: string) {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY; // safer to store in env

  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${accessKey}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch photo: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.urls.regular as string;
}
