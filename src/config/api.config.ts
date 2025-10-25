export const apiConfig = {
  baseUrl: typeof window !== 'undefined' 
    ? (window as any).__NEXT_DATA__?.props?.pageProps?.apiUrl || 'http://localhost:3000'
    : 'http://localhost:3000',
  endpoints: {
    PRODUCAO: '/lista_producao',
    PRONTOS: '/lista_prontos'
  }
};