"use server";

import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const getOrderById = async (id: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      message: "Debe de etar autenticado",
    };
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        OrderAddress: true,
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            size: true,

            product: {
              select: {
                title: true,
                slug: true,

                ProductImage: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) throw `${id} no existe - 500`;

    // Verificar que el usuario sea el dueño de la orden
    if (session.user.role === "user") {
      if (session.user.id !== order.userId) {
        throw `${id} no es de ese usuario`;
      }
    }

    return {
      ok: true,
      order,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Orden no existe",
    };
  }
};
