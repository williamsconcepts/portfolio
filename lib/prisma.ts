// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

function getFallbackValue(method: string) {
  switch (method) {
    case "findMany":
    case "findFirst":
    case "findUnique":
      return [];
    case "count":
      return 0;
    case "create":
    case "update":
    case "delete":
    case "upsert":
      return null;
    default:
      return undefined;
  }
}

function createSafeModel(modelName: string) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const method = String(prop);
        return async (...args: unknown[]) => {
          try {
            const model = (prismaClient as unknown as Record<string, Record<string, unknown>>)[modelName];
            const action = model?.[method];

            if (typeof action !== "function") {
              return getFallbackValue(method);
            }

            return await action(...args);
          } catch (error) {
            console.warn(`[prisma] ${modelName}.${method} failed`, error);
            return getFallbackValue(method);
          }
        };
      },
    }
  );
}

export const prisma = new Proxy(prismaClient, {
  get(target, prop, receiver) {
    if (typeof prop === "string" && prop.startsWith("$")) {
      return Reflect.get(target, prop, receiver);
    }

    const value = Reflect.get(target, prop, receiver);
    if (typeof prop === "string" && value && typeof value === "object" && !prop.startsWith("$")) {
      return createSafeModel(prop);
    }

    return value;
  },
});
