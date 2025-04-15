import { supabase } from "./supabase";
import { auth } from "../firebase";

// User functions
export async function syncUserToSupabase(
  userId: string,
  email: string,
  displayName: string,
  role: string,
) {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: userId,
      email,
      display_name: displayName,
      role,
    })
    .select();

  if (error) {
    console.error("Error syncing user to Supabase:", error);
    throw error;
  }

  return data[0];
}

export async function getCurrentUser() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", firebaseUser.uid)
    .single();

  if (error) {
    console.error("Error fetching current user from Supabase:", error);
    return null;
  }

  return data;
}

export async function getUsers(role?: string) {
  let query = supabase.from("users").select("*");

  if (role) {
    query = query.eq("role", role);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data;
}

// Health Records functions
export async function getHealthRecords(patientId?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  let query = supabase.from("health_records").select(`
    *,
    patient:patient_id(id, display_name, email, role),
    doctor:doctor_id(id, display_name, email, role)
  `);

  // If a specific patient ID is provided, filter by that
  if (patientId) {
    query = query.eq("patient_id", patientId);
  }
  // Otherwise, if the current user is a patient, only show their records
  else if (currentUser.role === "patient") {
    query = query.eq("patient_id", currentUser.id);
  }

  const { data, error } = await query.order("date", { ascending: false });

  if (error) {
    console.error("Error fetching health records:", error);
    throw error;
  }

  return data;
}

export async function addHealthRecord(record: any) {
  const { data, error } = await supabase
    .from("health_records")
    .insert(record)
    .select();

  if (error) {
    console.error("Error adding health record:", error);
    throw error;
  }

  return data[0];
}

export async function updateHealthRecord(id: string, updates: any) {
  const { data, error } = await supabase
    .from("health_records")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating health record:", error);
    throw error;
  }

  return data[0];
}

// Appointments functions
export async function getAppointments(
  filter?: "upcoming" | "past" | "cancelled",
  userId?: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  let query = supabase.from("appointments").select(`
    *,
    patient:patient_id(id, display_name, email, role),
    doctor:doctor_id(id, display_name, email, role)
  `);

  // Apply role-based filters
  if (currentUser.role === "patient") {
    query = query.eq("patient_id", currentUser.id);
  } else if (currentUser.role === "healthcare" && !userId) {
    query = query.eq("doctor_id", currentUser.id);
  }

  // If a specific user ID is provided (for admin or healthcare viewing a specific patient)
  if (userId) {
    if (currentUser.role === "healthcare" || currentUser.role === "admin") {
      query = query.eq("patient_id", userId);
    }
  }

  // Apply status filters
  if (filter === "upcoming") {
    query = query.eq("status", "scheduled");
  } else if (filter === "past") {
    query = query.eq("status", "completed");
  } else if (filter === "cancelled") {
    query = query.eq("status", "cancelled");
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  return data;
}

export async function addAppointment(appointment: any) {
  const { data, error } = await supabase
    .from("appointments")
    .insert(appointment)
    .select();

  if (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }

  return data[0];
}

export async function updateAppointment(id: string, updates: any) {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }

  return data[0];
}

// Messaging functions
export async function getConversations() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  // Get all conversations where the current user is a participant
  const { data: participantData, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUser.id);

  if (participantError) {
    console.error("Error fetching conversations:", participantError);
    throw participantError;
  }

  if (!participantData.length) return [];

  const conversationIds = participantData.map((p) => p.conversation_id);

  // Get the conversations with their participants
  const { data: conversationsData, error: conversationsError } = await supabase
    .from("conversations")
    .select(
      `
      id,
      created_at,
      participants:conversation_participants(user_id, users:user_id(id, display_name, email, role))
    `,
    )
    .in("id", conversationIds);

  if (conversationsError) {
    console.error("Error fetching conversation details:", conversationsError);
    throw conversationsError;
  }

  // Get the last message for each conversation
  const conversationsWithLastMessage = await Promise.all(
    conversationsData.map(async (conversation) => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          is_read,
          created_at,
          sender:sender_id(id, display_name, email, role)
        `,
        )
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (messagesError) {
        console.error("Error fetching last message:", messagesError);
        return conversation;
      }

      // Count unread messages
      const { count, error: countError } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", currentUser.id);

      if (countError) {
        console.error("Error counting unread messages:", countError);
      }

      // Format the conversation data
      const otherParticipants = conversation.participants
        .filter((p: any) => p.user_id !== currentUser.id)
        .map((p: any) => p.users);

      const lastMessage =
        messagesData && messagesData.length > 0 ? messagesData[0] : null;

      return {
        id: conversation.id,
        participantId: otherParticipants[0]?.id,
        participantName: otherParticipants[0]?.display_name,
        participantRole: otherParticipants[0]?.role,
        lastMessage: lastMessage?.content,
        lastMessageTime: lastMessage?.created_at,
        unreadCount: count || 0,
      };
    }),
  );

  return conversationsWithLastMessage;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      is_read,
      created_at,
      sender:sender_id(id, display_name, email, role)
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }

  // Mark messages as read
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUser.id);
  }

  return data.map((message) => ({
    id: message.id,
    senderId: message.sender.id,
    senderName: message.sender.display_name,
    content: message.content,
    timestamp: new Date(message.created_at),
    isRead: message.is_read,
  }));
}

export async function sendMessage(conversationId: string, content: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      is_read: false,
    })
    .select();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data[0];
}

export async function createConversation(participantId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  // Check if conversation already exists
  const { data: existingConversations, error: checkError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUser.id);

  if (checkError) {
    console.error("Error checking existing conversations:", checkError);
    throw checkError;
  }

  if (existingConversations.length > 0) {
    const conversationIds = existingConversations.map((c) => c.conversation_id);

    const { data: participantCheck, error: participantError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", participantId)
      .in("conversation_id", conversationIds);

    if (participantError) {
      console.error("Error checking participant:", participantError);
      throw participantError;
    }

    if (participantCheck.length > 0) {
      return participantCheck[0].conversation_id;
    }
  }

  // Create new conversation
  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .insert({})
    .select();

  if (conversationError) {
    console.error("Error creating conversation:", conversationError);
    throw conversationError;
  }

  const conversationId = conversationData[0].id;

  // Add participants
  const { error: participantsError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversationId, user_id: currentUser.id },
      { conversation_id: conversationId, user_id: participantId },
    ]);

  if (participantsError) {
    console.error("Error adding participants:", participantsError);
    throw participantsError;
  }

  return conversationId;
}

// Community functions
export async function getCommunityPosts(category?: string) {
  let query = supabase.from("community_posts").select(`
    *,
    author:author_id(id, display_name, email, role)
  `);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }

  return data;
}

export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from("community_comments")
    .select(
      `
      *,
      author:author_id(id, display_name, email, role)
    `,
    )
    .eq("post_id", postId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }

  return data;
}

export async function createCommunityPost(post: any) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert(post)
    .select();

  if (error) {
    console.error("Error creating community post:", error);
    throw error;
  }

  return data[0];
}

export async function addComment(comment: any) {
  const { data, error } = await supabase
    .from("community_comments")
    .insert(comment)
    .select();

  if (error) {
    console.error("Error adding comment:", error);
    throw error;
  }

  return data[0];
}

// Access request functions
export async function createAccessRequest(
  patientId: string,
  recordId: string,
  requestReason: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("access_requests")
    .insert({
      requester_id: currentUser.id,
      patient_id: patientId,
      record_id: recordId,
      request_reason: requestReason,
    })
    .select();

  if (error) {
    console.error("Error creating access request:", error);
    throw error;
  }

  return data[0];
}

export async function getAccessRequests(status?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated");

  let query = supabase.from("access_requests").select(`
    *,
    requester:requester_id(id, display_name, email, role),
    patient:patient_id(id, display_name, email, role),
    record:record_id(id, title, record_type, date)
  `);

  if (currentUser.role === "patient") {
    query = query.eq("patient_id", currentUser.id);
  } else if (currentUser.role === "healthcare") {
    query = query.eq("requester_id", currentUser.id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching access requests:", error);
    throw error;
  }

  return data;
}

export async function updateAccessRequest(
  id: string,
  status: "approved" | "rejected",
  responseReason?: string,
) {
  const { data, error } = await supabase
    .from("access_requests")
    .update({
      status,
      response_reason: responseReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating access request:", error);
    throw error;
  }

  return data[0];
}
