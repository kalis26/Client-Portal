export type ServiceItem = { description: string; quantity: number; unitAmount: string };

const cents = (amount: string) => Math.round(Number(amount) * 100);
const amount = (value: number) => (value / 100).toFixed(2);

export function projectTotal(items: ServiceItem[]) {
  return amount(items.reduce((total, item) => total + cents(item.unitAmount) * item.quantity, 0));
}

/** Allocates an exact 20% deposit across line items, with the rounding remainder on the final line. */
export function depositItems(items: ServiceItem[]) {
  const total = cents(projectTotal(items));
  const target = Math.round(total * 0.2);
  let allocated = 0;
  return items.map((item, index) => {
    const line = cents(item.unitAmount) * item.quantity;
    const share = index === items.length - 1 ? target - allocated : Math.round(line * 0.2);
    allocated += share;
    return { description: `${item.description} (20% deposit)`, quantity: 1, unitAmount: amount(share), lineAmount: amount(share) };
  });
}

export function depositTotal(items: ServiceItem[]) {
  return amount(Math.round(cents(projectTotal(items)) * 0.2));
}
