import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7"; // days

  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/coins/ethereum/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: range,
        },
      }
    );

    const formatted = res.data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price,
    }));
    // console.log(formatted);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
// // app/api/moralis/route.ts
// import { NextResponse } from 'next/server';
// import axios from 'axios';

// export async function GET(request: Request) {
//   try {
//     const res = await axios.get('https://deep-index.moralis.io/api/v2.2/erc20/:address/price', {
//       headers: {
//         'X-API-Key': process.env.MORALIS_API_KEY!,
//       },
//     });

//     return NextResponse.json(res.data);
//   } catch (error) {
//     console.error('Error fetching ETH price from Moralis:', error);
//     return NextResponse.json({ error: 'Failed to fetch ETH price' }, { status: 500 });
//   }
// }
// // Dependencies to install:
// $ npm install node-fetch --save
// add "type": "module" to package.json

// import fetch from 'node-fetch';

// const options = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImM0NGJhNzMwLWE3NzgtNDY0OS1hYTMxLTgyMmVkNGFlNWQyZCIsIm9yZ0lkIjoiNDQ0ODczIiwidXNlcklkIjoiNDU3NzIxIiwidHlwZUlkIjoiZmY4MDQ2MzctOTRiNi00MjY0LWJhNWYtM2FmZWYxZWVhZjFlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDYxNjI4MzAsImV4cCI6NDkwMTkyMjgzMH0.Q4krfinMZmTXahb2vp8i68qWpHiiJQvNzCdW0E_cC28'
//   },
// };

// fetch('https://deep-index.moralis.io/api/v2.2/erc20/0x6982508145454ce325ddbe47a25d4ec3d2311933/holders?chain=eth', options)
//   .then(response => response.json())
//   .then(response => console.log(response))
//   .catch(err => console.error(err));
  // import React, { useEffect } from "react";
  // import "./chart.css";

  // declare global {
  //   interface Window {
  //     TradingView: any;
  //   }
  // }

  // const ChartContainer: React.FC = () => {
  //   useEffect(() => {
  //     // Chart widget
  //     const chartScript = document.createElement("script");
  //     chartScript.src = "https://s3.tradingview.com/tv.js";
  //     chartScript.async = true;
  //     chartScript.onload = () => {
  //       if (window.TradingView) {
  //         new window.TradingView.widget({
  //           autosize: true,
  //           symbol: "BINANCE:SUIUSDC",
  //           interval: "D",
  //           timezone: "Etc/UTC",
  //           theme: "dark",
  //           style: "1",
  //           locale: "en",
  //           toolbar_bg: "#f1f3f6",
  //           enable_publishing: false,
  //           withdateranges: true,
  //           hide_side_toolbar: false,
  //           allow_symbol_change: true,
  //           details: true,
  //           hotlist: false,
  //           watchlist: true,
  //           calendar: true,
  //           studies: ["STD;EMA"],
  //           show_popup_button: true,
