import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/lib/test/renderWithProviders';
import { GenreTags } from './GenreTags';

describe('GenreTags', () => {
  it('장르마다 목록 링크를 만들고 공백이 있는 이름도 주소에 넣는다', () => {
    renderWithProviders(<GenreTags genres={['드라마', 'TV 영화']} />);
    expect(screen.getByRole('link', { name: 'TV 영화' })).toHaveAttribute(
      'href',
      '/genres/TV%20%EC%98%81%ED%99%94',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('지금 보는 장르만 표시한다', () => {
    renderWithProviders(<GenreTags genres={['드라마', 'SF']} current="SF" />);
    expect(screen.getByRole('link', { name: 'SF' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '드라마' })).not.toHaveAttribute('aria-current');
  });
});
