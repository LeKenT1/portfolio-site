"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";

interface SectionContextValue {
  current: number;
  direction: number;
  boundary: number;
  sectionIds: string[];
  navigate: (index: number) => void;
  onTransitionComplete: () => void;
}

const SectionContext = createContext<SectionContextValue>({
  current: 0,
  direction: 1,
  boundary: 0,
  sectionIds: [],
  navigate: () => {},
  onTransitionComplete: () => {},
});

export const useSectionNav = () => useContext(SectionContext);

interface Props {
  children: ReactNode;
  sectionIds: string[];
}

export function SectionProvider({ children, sectionIds }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [boundary, setBoundary] = useState(0);
  const isAnimating = useRef(false);

  const navigate = useCallback(
    (index: number) => {
      if (isAnimating.current) return;
      if (index < 0 || index >= sectionIds.length) return;
      if (index === current) return;
      isAnimating.current = true;
      setBoundary(Math.min(current, index));
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current, sectionIds.length]
  );

  const onTransitionComplete = useCallback(() => {
    isAnimating.current = false;
  }, []);

  return (
    <SectionContext.Provider
      value={{ current, direction, boundary, sectionIds, navigate, onTransitionComplete }}
    >
      {children}
    </SectionContext.Provider>
  );
}
