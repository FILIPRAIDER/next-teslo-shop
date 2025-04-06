/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";

export const getUserAddress = async (userId: string) => {
  try {
    const address = await prisma.userAddress.findUnique({
      where: {
        userId,
      },
    });

    if (!address) return null;

    const { countryId, address2, userId: _userId, ...rest } = address;

    return {
      ...rest,
      country: countryId,
      address2: address2 ? address2 : "",
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
