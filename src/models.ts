export interface Video {
  id?: string;
  url?: string;
  title: string;
  thumbnail?: string;
  duration: number;
  createdDate?: Date;
  description: string;
  apiId: string;
  from: string;
}