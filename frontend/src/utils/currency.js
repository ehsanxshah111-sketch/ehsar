// Pakistani Rupee formatting used everywhere a price is shown. PKR retail
// pricing is conventionally whole rupees (no paisa/decimals) with
// comma-separated thousands, e.g. "Rs 4,999" rather than "Rs 4,999.00".
export const formatPKR = (amount) => {
  const value = Number(amount) || 0;
  return `Rs ${Math.round(value).toLocaleString("en-PK")}`;
};
