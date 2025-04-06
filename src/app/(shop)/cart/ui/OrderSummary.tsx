"use client";

import { useCartStore } from "@/store";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { currencyFormat } from "../../../../utils/currencyFormat";
import { redirect } from "next/navigation";

export const OrderSummary = () => {
  const [loaded, setLoaded] = useState(false);
  const { subTotal, tax, total, itemsInCart } = useCartStore(
    useShallow((state) => state.getSumaryInformation())
  );

  useEffect(() => {
    if (itemsInCart === 0 && loaded === true) {
      redirect("/empty");
    }
    setLoaded(true);
  }, [itemsInCart, loaded]);
  if (!loaded) return <p>Loading...</p>;

  return (
    <>
      <div className="grid grid-cols-2">
        <span>No. Productos</span>
        <span className="text-right">
          {itemsInCart === 1 ? "1 artículo" : `${itemsInCart} artículos`}
        </span>

        <span>Subtotal</span>
        <span className="text-right">{currencyFormat(subTotal)}</span>

        <span>Impuestos (15%)</span>
        <span className="text-right">{currencyFormat(tax)}</span>

        <span className="mt-5 text-2xl">Total:</span>
        <span className="mt-5 text-2xl text-right">
          {currencyFormat(total)}
        </span>
      </div>
    </>
  );
};
