"use server";

import { PayPalOrderStatusResponse } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const paypalCheckPayment = async (paypaltransactionId: string) => {
  const authToken = await getPayPalBearerToken();

  if (!authToken) {
    console.log("No se pudo obtener el token de PayPal");
    return {
      ok: false,
      message: "No se pudo obtener el token de PayPal",
    };
  }

  const resp = await verifyPaypalPayment(paypaltransactionId, authToken);

  if (!resp) {
    return {
      ok: false,
      message: "No se pudo verificar el pago",
    };
  }

  const { status, purchase_units } = resp;
  const { invoice_id: orderId } = purchase_units[0];

  if (status !== "COMPLETED") {
    return {
      ok: false,
      message: "El pago no se ha completado",
    };
  }

  // Todo: Realizar la actualizacion en nuestra base de datos

  try {
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        paidAt: new Date(),
      },
    });

    // Todo: Revalidar un path
    revalidatePath(`/orders/${orderId}`);
    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error al actualizar la base de datos",
    };
  }
};

const getPayPalBearerToken = async (): Promise<string | null> => {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
  const oauth2Url = process.env.PAYPAL_OAUTH_URL ?? "";

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    console.log("❌ Variables PAYPAL_CLIENT_ID o PAYPAL_SECRET faltan");
    return null;
  }

  const base64Token = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`,
    "utf-8"
  ).toString("base64");

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", `Basic ${base64Token}`);

  const urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  try {
    const res = await fetch(oauth2Url, {
      ...requestOptions,
      cache: "no-store",
    });
    const result = await res.json();

    if (!res.ok) {
      console.log("❌ Error al obtener token PayPal:", result);
      return null;
    }

    return result.access_token;
  } catch (error) {
    console.log("❌ Error inesperado:", error);
    return null;
  }
};

const verifyPaypalPayment = async (
  paypalTransactionId: string,
  bearerToken: string
): Promise<PayPalOrderStatusResponse | null> => {
  const paypalOrderUrl = `${process.env.PAYPAL_ORDERS_URL}/${paypalTransactionId}`;

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${bearerToken}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    const resp = await fetch(paypalOrderUrl, {
      ...requestOptions,
      cache: "no-store",
    }).then((r) => r.json());
    return resp;
  } catch (error) {
    console.log(error);
    return null;
  }
};
