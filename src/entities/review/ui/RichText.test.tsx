import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RichText } from './RichText';

it('RichText는 서식을 그대로 그린다', () => {
  render(
    <RichText
      doc={{
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '소제목' }] },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '굵은 글', marks: [{ type: 'bold' }] },
              { type: 'text', text: '링크', marks: [{ type: 'link', attrs: { href: 'https://a.example' } }] },
            ],
          },
          { type: 'image', attrs: { src: '/seed/a.svg', alt: '장면' } },
        ],
      }}
    />,
  );
  expect(screen.getByRole('heading', { level: 2, name: '소제목' })).toBeInTheDocument();
  expect(screen.getByText('굵은 글').closest('strong')).not.toBeNull();
  expect(screen.getByRole('link', { name: '링크' })).toHaveAttribute('href', 'https://a.example');
  expect(screen.getByAltText('장면')).toBeInTheDocument();
});

it('RichText는 저장값이 잘못되어도 위험한 내용을 그리지 않는다', () => {
  const { container } = render(
    <RichText
      doc={{
        type: 'doc',
        content: [
          { type: 'script', text: 'alert(1)' },
          { type: 'image', attrs: { src: 'https://evil.example/a.png', alt: '외부' } },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '글자만',
                marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
              },
            ],
          },
          { type: 'paragraph', content: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] },
        ],
      }}
    />,
  );
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('img')).toBeNull();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
});
