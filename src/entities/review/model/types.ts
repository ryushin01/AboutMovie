export interface Scene {
  id: string;
  /** 이미지 data URL */
  src: string;
  /** 장면 설명. 이미지의 대체 텍스트로 쓰입니다. */
  description: string;
}

export interface Review {
  id: string;
  title: string;
  year: number;
  /** 1~5 */
  rating: number;
  /** 이미지 data URL */
  poster: string;
  scenes: Scene[];
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };
