import { useEffect, RefObject, useCallback } from 'react';

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'center';

export function useFloating(
  triggerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  open: boolean,
  position: Placement = 'bottom-start',
  offset: number = 8
) {
  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

    let x = 0;
    let y = 0;

    switch (position) {
      case 'bottom-start':
      case 'bottom-left':
        x = isRTL && position === 'bottom-start' ? triggerRect.right - contentRect.width : triggerRect.left;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom-end':
      case 'bottom-right':
        x = isRTL && position === 'bottom-end' ? triggerRect.left : triggerRect.right - contentRect.width;
        y = triggerRect.bottom + offset;
        break;
      case 'bottom':
      case 'bottom-center':
        x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        y = triggerRect.bottom + offset;
        break;
      case 'top-start':
      case 'top-left':
        x = isRTL && position === 'top-start' ? triggerRect.right - contentRect.width : triggerRect.left;
        y = triggerRect.top - contentRect.height - offset;
        break;
      case 'top-end':
      case 'top-right':
        x = isRTL && position === 'top-end' ? triggerRect.left : triggerRect.right - contentRect.width;
        y = triggerRect.top - contentRect.height - offset;
        break;
      case 'top':
      case 'top-center':
        x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        y = triggerRect.top - contentRect.height - offset;
        break;
      case 'left':
        x = triggerRect.left - contentRect.width - offset;
        y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - contentRect.width - offset;
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - contentRect.width - offset;
        y = triggerRect.bottom - contentRect.height;
        break;
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + offset;
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + offset;
        y = triggerRect.bottom - contentRect.height;
        break;
      case 'center':
        x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        break;
    }

    // Prevent overflow on viewport (horizontal)
    if (x + contentRect.width > window.innerWidth - 8) {
      x = window.innerWidth - contentRect.width - 8;
    }
    if (x < 8) x = 8;
    
    // Prevent overflow on viewport (vertical)
    if (y + contentRect.height > window.innerHeight - 8) {
      y = triggerRect.top - contentRect.height - offset; // Flip to top
    }
    if (y < 8) y = 8;

    Object.assign(contentRef.current.style, {
      left: `${x}px`,
      top: `${y}px`,
      visibility: 'visible'
    });
  }, [open, position, offset, triggerRef, contentRef]);

  useEffect(() => {
    if (open) {
      let frameCount = 0;
      let rafId: number;
      
      const checkAndPosition = () => {
        if (contentRef.current && triggerRef.current) {
          updatePosition();
          if (frameCount < 3) {
            frameCount++;
            rafId = requestAnimationFrame(checkAndPosition);
          }
        } else if (frameCount < 10) {
          frameCount++;
          rafId = requestAnimationFrame(checkAndPosition);
        }
      };
      
      if (contentRef.current) {
        contentRef.current.style.visibility = 'hidden';
      }
      
      rafId = requestAnimationFrame(checkAndPosition);

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition, contentRef, triggerRef]);

  return { updatePosition };
}
