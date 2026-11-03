import { forwardRef, useState, type HTMLAttributes } from 'react';
import { Typography } from '../Typography/Typography';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg';
type Identity = { name: string; decorative?: false } | { name?: string; decorative: true };
export type AvatarProps = Identity &
  Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'style' | 'role' | 'aria-label' | 'aria-hidden' | 'onClick' | 'tabIndex'
  > & {
    size?: AvatarSize;
    content?: 'initials' | 'fallback';
    initials?: string;
    /** Imagem opcional substitui o visual; falha recupera iniciais ou fallback. */
    src?: string;
  };
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    decorative = false,
    size = 'sm',
    content = 'initials',
    initials,
    src,
    className,
    ...props
  },
  ref,
) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const text = initials?.trim() ?? '';
  const count = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)]
    .length;
  const showInitials = content === 'initials' && count > 0 && count <= 2;
  const showImage = !!src && failedSrc !== src;
  return (
    <span
      {...props}
      ref={ref}
      className={[styles.avatar, className].filter(Boolean).join(' ')}
      data-size={size}
      data-avatar=""
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
    >
      {showImage ? (
        <img
          key={src}
          className={styles.image}
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
        />
      ) : showInitials ? (
        <Typography
          as="span"
          aria-hidden="true"
          tone="inherit"
          variant={size === 'sm' ? 'label-s' : size === 'md' ? 'label-m' : 'display-m'}
        >
          {text}
        </Typography>
      ) : (
        <span aria-hidden="true" className={styles.fallback} />
      )}
    </span>
  );
});
