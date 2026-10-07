"use server";

import { createClient } from "@/utils/supabase/server";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export type NotificationRecord = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  read: boolean;
  created_at: string;
};

export async function actionGetNotifications(): Promise<{
  notifications: NotificationRecord[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { notifications: [], unreadCount: 0, error: "Unauthorized" };
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id),
      getUnreadCount(user.id),
    ]);

    return {
      notifications: (notifications || []) as NotificationRecord[],
      unreadCount: unreadCount || 0,
    };
  } catch (err: unknown) {
    console.error("actionGetNotifications error:", err);
    return { notifications: [], unreadCount: 0, error: "Failed to fetch notifications" };
  }
}

export async function actionMarkAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await markNotificationAsRead(notificationId);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/employer", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("actionMarkAsRead error:", err);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function actionMarkAllAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await markAllNotificationsAsRead(user.id);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/employer", "layout");
    return { success: true };
  } catch (err: unknown) {
    console.error("actionMarkAllAsRead error:", err);
    return { success: false, error: "Failed to update notifications" };
  }
}
