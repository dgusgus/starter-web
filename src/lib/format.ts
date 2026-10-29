const locale = import.meta.env.VITE_LOCALE ?? "es-BO";
const currency = import.meta.env.VITE_CURRENCY ?? "BOB";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Starter Web";

const money = new Intl.NumberFormat(locale, { style: "currency", currency });
const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

export const formatMoney = (value: number) => money.format(value);
export const formatDate = (iso: string) => date.format(new Date(iso));
