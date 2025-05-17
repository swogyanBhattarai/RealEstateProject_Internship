// utils/fetchETHPrice.ts
export const fetchETHPrice = async (range: string = '7d') => {
  const res = await fetch(`/api/price?range=${range}`);

  if (!res.ok) {
    const errorDetail = await res.text();
    console.error(`Error fetching ETH price: ${errorDetail}`);
    throw new Error('Failed to fetch ETH price');
  }

  return await res.json();
};
