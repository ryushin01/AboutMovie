export interface CardSlot {
  /** 12칸 격자에서 차지하는 칸 수 */
  span: 3 | 6;
  /** 잡지처럼 살짝 내려 놓을지 여부 */
  offset: boolean;
}

const slot = (span: CardSlot['span'], offset = false): CardSlot => ({ span, offset });

/**
 * 큰 카드 1장과 작은 카드 2장으로 이루어진 줄을 좌우 번갈아 놓습니다.
 * 남는 카드가 있으면 마지막 줄에 큰 빈칸이 생기지 않도록 배치를 바꿉니다.
 */
export function cardLayout(count: number): CardSlot[] {
  if (count === 1) return [slot(6)];

  const rest = count % 3;
  const fullRows = (count - rest) / 3 - (rest === 1 ? 1 : 0);
  const slots: CardSlot[] = [];

  for (let row = 0; row < fullRows; row += 1) {
    if (row % 2 === 0) slots.push(slot(6), slot(3, true), slot(3));
    else slots.push(slot(3), slot(3), slot(6));
  }
  if (rest === 1) slots.push(slot(3), slot(3), slot(3), slot(3));
  if (rest === 2) slots.push(slot(6), slot(6));

  return slots;
}
