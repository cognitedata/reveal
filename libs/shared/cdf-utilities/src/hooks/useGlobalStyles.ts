import { useEffect, useState } from 'react';

/**
 *
 * @param styles An array of esmodule imported .css files
 *
 * The hook should load and unload styles when the parent component mounts and unmounts.
 * It will return an identifier that the component can use to determine wether not styles are injected in the dom.
 * const hasStyles = useGlobalStyles([antdCss, cogsCss, myCustomCss]);
 */
export default function useGlobalStyles<
  T extends { use: () => object; unuse: () => object }
>(styles: T[]) {
  const [hasInjectedStyles, setHasInjectedStyles] = useState(false);

  useEffect(() => {
    styles.forEach((style) => {
      style.use();
    });
    setHasInjectedStyles(true);
    return () => {
      styles.forEach((style) => {
        style.unuse();
      });
    };
  }, [styles, setHasInjectedStyles]);

  return hasInjectedStyles;
}
