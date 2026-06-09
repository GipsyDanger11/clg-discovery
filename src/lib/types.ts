export interface College {
  id: string;
  name: string;
  location: string;
  fees: number;
  rating: number;
  overview: string;
  courses: string;
  placements: string;
  established: number | null;
  type: string | null;
  website: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeWithReviews extends College {
  reviews: Review[];
}

export interface Review {
  id: string;
  collegeId: string;
  userId: string;
  rating: number;
  comment: string;
  user: { id: string; name: string | null; image: string | null };
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CollegesResponse {
  colleges: College[];
  pagination: PaginationInfo;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
