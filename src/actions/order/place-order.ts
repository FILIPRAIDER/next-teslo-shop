/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth.config";
import { Address, Size } from "@/interfaces";
import { prisma } from "@/lib/prisma";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  const session = await auth();
  const userId = session?.user?.id;

  // Verificar sesión de usuario
  if (!userId) {
    return {
      ok: false,
      message: "No hay sesión de usuario",
    };
  }

  // Obtener la información de los productos
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds.map((p) => p.productId),
      },
    },
  });

  // Calcular montos
  const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

  const { subTotal, tax, total } = productIds.reduce(
    (totals, item) => {
      const productQuantity = item.quantity;
      const product = products.find((p) => p.id === item.productId);

      if (!product) throw new Error(`${item.productId} no existe - 500`);

      const subTotal = product.price * productQuantity;

      totals.subTotal += subTotal;
      totals.tax += subTotal * 0.15;
      totals.total += subTotal * 1.15;

      return totals;
    },
    { subTotal: 0, tax: 0, total: 0 }
  );

  try {
    const prismaTx = await prisma.$transaction(async (tx) => {
      // 1. Actualizar el stock de productos
      const updatedProducts = await Promise.all(
        products.map((product) => {
          const productQuantity = productIds
            .filter((p) => p.productId === product.id)
            .reduce((acc, item) => item.quantity + acc, 0);

          if (productQuantity === 0) {
            throw new Error(`${product.id} no tiene cantidad definida`);
          }

          return tx.product.update({
            where: { id: product.id },
            data: {
              inStock: {
                decrement: productQuantity,
              },
            },
          });
        })
      );

      updatedProducts.forEach((product) => {
        if (product.inStock < 0) {
          throw new Error(
            `${product.id} no hay stock para el producto solicitado`
          );
        }
      });

      // 2. Crear la orden
      const order = await tx.order.create({
        data: {
          userId,
          itemsInOrder,
          subTotal,
          tax,
          total,
          OrderItem: {
            createMany: {
              data: productIds.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                productId: p.productId,
                price:
                  products.find((product) => product.id === p.productId)
                    ?.price ?? 0,
              })),
            },
          },
        },
      });

      // 3. Crear la dirección de la orden
      // quitamos también el campo id, si viene desde el frontend
      const { country, ...restAddress } = address;

      const orderAddress = await tx.orderAddress.create({
        data: {
          ...restAddress,
          countryId: country,
          orderId: order.id,
        },
      });

      return {
        updatedProducts,
        order,
        orderAddress,
      };
    });

    return {
      ok: true,
      order: prismaTx.order,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error.message,
    };
  }
};
