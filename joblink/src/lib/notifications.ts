import { createClient } from "@/utils/supabase/server";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId,
        read: false,
      });

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw error;
  }
}

export async function getNotifications(userId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    throw error;
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return 0;
  }
}
