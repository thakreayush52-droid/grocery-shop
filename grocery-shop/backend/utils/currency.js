export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateGST = (subtotal, gstRate = 0) => {
  const gstAmount = subtotal * (gstRate / 100);
  return {
    gstAmount,
    total: subtotal + gstAmount
  };
};

export const calculateTotals = (items, gstRate = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const { gstAmount, total } = calculateGST(subtotal, gstRate);
  return {
    subtotal,
    gstAmount,
    total
  };
};
