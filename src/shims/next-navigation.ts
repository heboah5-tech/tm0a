import { useLocation } from "wouter";

export function useRouter() {
  const [, setLocation] = useLocation();
  return {
    push: (url: string) => setLocation(url),
    replace: (url: string) => setLocation(url, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: (_url: string) => {},
  };
}

export function usePathname(): string {
  const [location] = useLocation();
  return location;
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return {} as T;
}
