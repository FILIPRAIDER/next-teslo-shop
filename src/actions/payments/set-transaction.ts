"use server";

import { prisma } from "@/lib/prisma";

export const setTransactionId = async (
  orderId: string,
  transactionId: string
) => {
  try {
    const orderUpdate = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        transactionId,
      },
    });

    if (!orderUpdate) {
      return {
        ok: false,
        error: `No se encontro una orden con el ${orderId}`,
      };
    }

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      error: "Error al actualizar la orden",
    };
  }
};
