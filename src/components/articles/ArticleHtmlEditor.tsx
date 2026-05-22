'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cmsField, cmsTextarea } from '@/lib/cms-ui-classes'

type EditorTab = 'visual' | 'html'

interface ArticleHtmlEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        'p-2 rounded-md border border-border-default min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors',
        active
          ? 'bg-primary text-[rgb(var(--color-on-accent))]'
          : 'bg-surface text-text-muted hover:text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default function ArticleHtmlEditor({ value, onChange, disabled = false }: ArticleHtmlEditorProps) {
  const [tab, setTab] = useState<EditorTab>('visual')
  const skipNextEditorUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your article…',
      }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (skipNextEditorUpdate.current) {
        skipNextEditorUpdate.current = false
        return
      }
      onChange(ed.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || tab !== 'visual') return
    const current = editor.getHTML()
    if (value !== current) {
      skipNextEditorUpdate.current = true
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor, tab])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [editor, disabled])

  const switchToHtml = useCallback(() => {
    if (editor) {
      onChange(editor.getHTML())
    }
    setTab('html')
  }, [editor, onChange])

  const switchToVisual = useCallback(() => {
    if (editor) {
      skipNextEditorUpdate.current = true
      try {
        editor.commands.setContent(value || '', false)
      } catch {
        /* invalid HTML — keep last good visual state */
      }
    }
    setTab('visual')
  }, [editor, value])

  const run = (fn: () => boolean) => {
    if (!editor || disabled) return
    fn()
  }

  const toggleLink = () => {
    if (!editor || disabled) return
    const previous = (editor.getAttributes('link').href as string) || ''
    const url = window.prompt('Link URL (https://…)', previous || 'https://')
    if (url === null) return
    const trimmed = url.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
  }

  return (
    <div className="rounded-lg border border-border-default overflow-hidden bg-[rgb(var(--color-surface))]">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border-default bg-[rgb(var(--color-surface-raised)/0.4)]">
        <div className="flex rounded-lg border border-border-default overflow-hidden mr-1">
          <button
            type="button"
            disabled={disabled}
            onClick={switchToVisual}
            className={[
              'px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 min-h-[36px]',
              tab === 'visual'
                ? 'bg-primary text-[rgb(var(--color-on-accent))]'
                : 'bg-surface text-text-muted hover:text-text',
            ].join(' ')}
          >
            Visual
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={switchToHtml}
            className={[
              'px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 min-h-[36px] border-l border-border-default',
              tab === 'html'
                ? 'bg-primary text-[rgb(var(--color-on-accent))]'
                : 'bg-surface text-text-muted hover:text-text',
            ].join(' ')}
          >
            HTML
          </button>
        </div>

        {tab === 'visual' && editor ? (
          <>
            <ToolbarButton
              title="Bold"
              disabled={disabled}
              active={editor.isActive('bold')}
              onClick={() => run(() => editor.chain().focus().toggleBold().run())}
            >
              <span className="text-sm font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton
              title="Italic"
              disabled={disabled}
              active={editor.isActive('italic')}
              onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
            >
              <span className="text-sm italic">I</span>
            </ToolbarButton>
            <ToolbarButton
              title="Link"
              disabled={disabled}
              active={editor.isActive('link')}
              onClick={toggleLink}
            >
              <span className="text-sm underline">Link</span>
            </ToolbarButton>
            <ToolbarButton
              title="Heading 2"
              disabled={disabled}
              active={editor.isActive('heading', { level: 2 })}
              onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
            >
              <span className="text-xs font-semibold">H2</span>
            </ToolbarButton>
            <ToolbarButton
              title="Heading 3"
              disabled={disabled}
              active={editor.isActive('heading', { level: 3 })}
              onClick={() => run(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
            >
              <span className="text-xs font-semibold">H3</span>
            </ToolbarButton>
            <ToolbarButton
              title="Bullet list"
              disabled={disabled}
              active={editor.isActive('bulletList')}
              onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}
            >
              <span className="text-sm">•</span>
            </ToolbarButton>
            <ToolbarButton
              title="Numbered list"
              disabled={disabled}
              active={editor.isActive('orderedList')}
              onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}
            >
              <span className="text-xs font-medium">1.</span>
            </ToolbarButton>
            <ToolbarButton
              title="Blockquote"
              disabled={disabled}
              active={editor.isActive('blockquote')}
              onClick={() => run(() => editor.chain().focus().toggleBlockquote().run())}
            >
              <span className="text-sm">&ldquo;</span>
            </ToolbarButton>
            <ToolbarButton
              title="Undo"
              disabled={disabled || !editor.can().undo()}
              onClick={() => run(() => editor.chain().focus().undo().run())}
            >
              <span className="text-xs">↶</span>
            </ToolbarButton>
            <ToolbarButton
              title="Redo"
              disabled={disabled || !editor.can().redo()}
              onClick={() => run(() => editor.chain().focus().redo().run())}
            >
              <span className="text-xs">↷</span>
            </ToolbarButton>
          </>
        ) : null}
      </div>

      {tab === 'visual' ? (
        <EditorContent
          editor={editor}
          className="article-html-editor__content min-h-[12rem] sm:min-h-[16rem] px-4 py-3 text-text [&_.ProseMirror]:min-h-[10rem] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-text-muted [&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={16}
          spellCheck={false}
          className={`${cmsTextarea} min-h-[12rem] sm:min-h-[16rem] font-mono text-sm rounded-none border-0 focus:ring-0 ${cmsField}`}
          placeholder="<p>Your HTML content…</p>"
          aria-label="Article HTML source"
        />
      )}

      <p className="px-3 py-2 text-xs text-text-muted border-t border-border-default bg-[rgb(var(--color-surface-raised)/0.25)]">
        Use <strong>Visual</strong> for everyday editing, or <strong>HTML</strong> for full markup control.
        Allowed tags: p, h2–h4, strong, em, a, ul, ol, li, blockquote.
      </p>
    </div>
  )
}
