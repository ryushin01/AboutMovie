import { css } from '@emotion/react';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, type KeyboardEvent, type RefObject } from 'react';
import { isSafeLink, type RichDoc } from '@/entities/review';
import { Field } from '@/shared/ui/Field';
import { inputCss } from '@/shared/ui/styles';
import { EditorDialog } from './EditorDialog';
import { ImageDialogFields, type ImageValue } from './ImageDialogFields';

const wrapCss = css`
  background: var(--surface);
  border: 1px solid var(--field-line);

  &:has(.ProseMirror[aria-invalid='true']) {
    border: 2px solid var(--accent);
  }
`;
const toolbarCss = css`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px;
  background: var(--surface);
  border-bottom: 1px solid var(--field-line);
`;
const toolCss = css`
  min-width: 44px;
  min-height: 44px;
  padding: 0 10px;
  color: var(--ink);
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 0.9375rem;
  cursor: pointer;

  &[aria-pressed='true'] {
    color: var(--bg);
    background: var(--ink);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
const contentCss = css`
  .ProseMirror {
    min-height: 320px;
    padding: 16px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }
  .ProseMirror:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: -3px;
  }
  .ProseMirror > :first-of-type {
    margin-top: 0;
  }
  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.2em;
  }
  blockquote {
    margin-inline: 0;
    padding-left: 1em;
    color: var(--muted);
    border-left: 4px solid var(--accent);
  }
  a {
    color: var(--accent);
  }
  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1em 0;
  }
  img.ProseMirror-selectednode {
    outline: 3px solid var(--accent);
  }
`;

const isAllowedUri = (url: string) => isSafeLink(url);

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    link: { openOnClick: false, isAllowedUri, protocols: ['http', 'https'] },
  }),
  Image.configure({ allowBase64: false }),
];

interface Tool {
  label: string;
  run: (editor: Editor) => void;
  /** 켜고 끄는 도구만 있습니다. */
  active?: (editor: Editor) => boolean;
  enabled?: (editor: Editor) => boolean;
}

const TOOLS: Tool[] = [
  {
    label: '제목',
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: (e) => e.isActive('heading', { level: 2 }),
  },
  {
    label: '소제목',
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: (e) => e.isActive('heading', { level: 3 }),
  },
  { label: '굵게', run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive('bold') },
  {
    label: '기울임',
    run: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive('italic'),
  },
  {
    label: '밑줄',
    run: (e) => e.chain().focus().toggleUnderline().run(),
    active: (e) => e.isActive('underline'),
  },
  {
    label: '인용',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    active: (e) => e.isActive('blockquote'),
  },
  {
    label: '글머리표',
    run: (e) => e.chain().focus().toggleBulletList().run(),
    active: (e) => e.isActive('bulletList'),
  },
  {
    label: '번호 목록',
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    active: (e) => e.isActive('orderedList'),
  },
  { label: '실행 취소', run: (e) => e.chain().focus().undo().run(), enabled: (e) => e.can().undo() },
  { label: '다시 실행', run: (e) => e.chain().focus().redo().run(), enabled: (e) => e.can().redo() },
];

/** 도구 모음은 Tab으로 한 번만 들어오고 안에서는 화살표로 움직입니다. (WAI-ARIA toolbar 패턴) */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const next = {
    ArrowRight: buttons[(index + 1) % buttons.length],
    ArrowLeft: buttons[(index - 1 + buttons.length) % buttons.length],
    Home: buttons[0],
    End: buttons[buttons.length - 1],
  }[event.key];
  if (!next) return;
  event.preventDefault();
  buttons.forEach((button) => (button.tabIndex = -1));
  next.tabIndex = 0;
  next.focus();
}

interface Props {
  value: RichDoc;
  onChange: (doc: RichDoc) => void;
  onUploadImage: (file: File) => Promise<string>;
  /** 오류가 있을 때 폼이 초점을 옮길 수 있게 편집기를 알려 줍니다. */
  editorRef: RefObject<Editor | null>;
  labelId: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

export default function RichEditor({
  value,
  onChange,
  onUploadImage,
  editorRef,
  labelId,
  invalid,
  describedBy,
  disabled,
}: Props) {
  const [dialog, setDialog] = useState<'link' | 'image' | null>(null);

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as RichDoc),
    editorProps: {
      // 다른 사이트의 이미지 주소가 본문에 섞이면 저장이 거부되므로 붙여넣을 때 뺍니다.
      transformPastedHTML: (html) => html.replace(/<img[^>]*>/gi, ''),
      // useEditor가 옵션을 다시 적용하므로 접근성 속성도 여기에 함께 둡니다.
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        ...(invalid ? { 'aria-invalid': 'true' } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);

  // 편집 영역은 입력 요소가 아니라 레이블을 눌러도 초점이 오지 않으므로 직접 옮깁니다.
  useEffect(() => {
    const label = document.getElementById(labelId);
    const focus = () => editor.commands.focus();
    label?.addEventListener('click', focus);
    return () => label?.removeEventListener('click', focus);
  }, [editor, labelId]);

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      pressed: TOOLS.map((tool) => tool.active?.(current)),
      enabled: TOOLS.map((tool) => tool.enabled?.(current) ?? true),
      link: current.isActive('link'),
    }),
  });

  const applyLink = (href: string) => {
    setDialog(null);
    const chain = editor.chain().focus().extendMarkRange('link');
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
  };

  const insertImage = ({ src, alt }: ImageValue) => {
    setDialog(null);
    editor.chain().focus().setImage({ src, alt }).run();
  };

  return (
    <div css={wrapCss}>
      {/* 초점은 안쪽 버튼이 받고, 화살표 키는 여기서 한꺼번에 처리합니다. */}
      {/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div role="toolbar" aria-label="글 서식" css={toolbarCss} onKeyDown={moveFocus}>
        {TOOLS.map((tool, index) => (
          <button
            key={tool.label}
            type="button"
            css={toolCss}
            tabIndex={index === 0 ? 0 : -1}
            aria-pressed={tool.active ? Boolean(state.pressed[index]) : undefined}
            disabled={disabled || !state.enabled[index]}
            onClick={() => tool.run(editor)}
          >
            {tool.label}
          </button>
        ))}
        <button
          type="button"
          css={toolCss}
          tabIndex={-1}
          aria-pressed={state.link}
          disabled={disabled}
          onClick={() => setDialog('link')}
        >
          링크
        </button>
        <button
          type="button"
          css={toolCss}
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setDialog('image')}
        >
          이미지
        </button>
      </div>
      <EditorContent editor={editor} css={contentCss} />

      {dialog === 'link' && (
        <LinkDialog
          initial={String(editor.getAttributes('link').href ?? '')}
          onApply={applyLink}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'image' && (
        <ImageDialogFields onUpload={onUploadImage} onInsert={insertImage} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}

function LinkDialog({
  initial,
  onApply,
  onClose,
}: {
  initial: string;
  onApply: (href: string) => void;
  onClose: () => void;
}) {
  const [href, setHref] = useState(initial);
  const [error, setError] = useState('');

  const submit = () => {
    const trimmed = href.trim();
    // 비워 두면 링크를 없앱니다. 주소만 적어도 되도록 https를 붙입니다.
    const url = trimmed && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? `https://${trimmed}` : trimmed;
    if (url && !isSafeLink(url)) {
      setError('http 또는 https 주소를 입력해 주세요.');
      return;
    }
    onApply(url);
  };

  return (
    <EditorDialog title="링크" submitLabel="적용" onSubmit={submit} onClose={onClose}>
      <Field label="주소" hint="비워 두면 링크를 없앱니다." error={error}>
        {(control) => (
          <input
            {...control}
            css={inputCss}
            type="url"
            inputMode="url"
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
        )}
      </Field>
    </EditorDialog>
  );
}
