"use server";

import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";

interface PaginationOptions {
  page?: number;
  take?: number;
  gender?: Gender;
}

export const getPaginatedProductsWithImages = async ({
  page = 1,
  take = 12,
  gender,
}: PaginationOptions) => {
  if (isNaN(Number(page))) page = 1;
  if (page < 1) page = 1;

  try {
    // 1. Obtener los productos
    const products = await prisma.product.findMany({
      include: {
        ProductImage: {
          take: 2, // solo tomar 2 imagenes
          select: {
            url: true,
          },
        },
      },
      skip: (page - 1) * take,
      take: take,

      where: {
        gender: gender,
      },
    });

    // 2. Obtener el total de paginas
    const totalCount = await prisma.product.count({
      where: {
        gender: gender,
      },
    });
    const totalPages = Math.ceil(totalCount / take);

    return {
      currentPage: page,
      totalPages: totalPages,
      products: products.map((product) => ({
        ...product,
        images: product.ProductImage.map((image) => image.url),
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("No se pudo cargar los productos");
  }
};
