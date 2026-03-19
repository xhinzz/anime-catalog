import { prisma } from "./prisma";

export async function logActivity(
  userId: number,
  action: string,
  opts?: {
    itemMalId?: number;
    itemType?: string;
    itemTitle?: string;
    itemImageUrl?: string;
    extra?: Record<string, unknown>;
  }
) {
  await prisma.activity.create({
    data: {
      userId,
      action,
      itemMalId: opts?.itemMalId,
      itemType: opts?.itemType,
      itemTitle: opts?.itemTitle,
      itemImageUrl: opts?.itemImageUrl,
      extra: opts?.extra ? JSON.stringify(opts.extra) : null,
    },
  });
}
