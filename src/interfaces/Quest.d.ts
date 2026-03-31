export interface CategoryInterface {
  _id: string;
  libelle: {
    fr: string;
    en: string;
  };
  slug: string;
  color: string;
}

export interface GoalInterface {
  _id: string;
  category_id: string | CategoryInterface;
  libelle: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  duree: number;
  is_group: boolean;
  is_indoor: boolean;
}

export interface UserGoalInterface {
  _id: string;
  user_id: string;
  goal_id: GoalInterface;
  status: "in_progress" | "completed" | "failed";
  started_at: Date;
  completed_at?: Date;
  progress_id?: GoalProgressInterface;
}

export interface FriendInterface {
  _id: string;
  user_id: {
    _id: string;
    username: string;
    name: string;
    forename: string;
    avatar: string;
    points: number;
  };
  friend_id: {
    _id: string;
    username: string;
    name: string;
    forename: string;
    avatar: string;
    points: number;
  };
  status: "pending" | "accepted" | "rejected";
}

export interface NotificationInterface {
  _id: string;
  user_id: string;
  type: string;
  ref_id?: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export interface GoalProgressInterface {
  _id: string;
  user_id: string;
  goal_id: string;
  group_id?: string;
  value: number;
  note: string;
  image_url?: string;
  logged_at: Date;
}

export interface LeaderboardUser {
  _id: string;
  username: string;
  name: string;
  forename: string;
  avatar: string;
  points: number;
}
