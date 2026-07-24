import { createClient } from "@/utils/supabase/server";

export async function createNotification(userId: string, type: string, title: string, message: string, relatedId?: string) {
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
      throw new Error(error.message);
    }
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
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
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
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    throw error;
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return 0;
  }
}
