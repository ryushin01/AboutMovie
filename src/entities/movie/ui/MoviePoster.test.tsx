import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MoviePoster } from './MoviePoster';

const movie = { title: '마지막 상영', poster: '/seed/a-poster.svg' };

it.each([
  ['도착하면', fireEvent.load],
  ['불러오지 못하면', fireEvent.error],
])('포스터는 %s 스켈레톤을 멈춘다', (_name, settle) => {
  render(<MoviePoster movie={movie} />);
  const image = screen.getByAltText('마지막 상영 포스터');
  expect(image).toHaveAttribute('data-skeleton', 'poster');

  settle(image);

  expect(image).not.toHaveAttribute('data-skeleton');
});
