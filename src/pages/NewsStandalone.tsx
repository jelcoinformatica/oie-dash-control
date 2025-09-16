import { NewsDisplay } from '../components/NewsDisplay';

// Página standalone para notícias - pode ser acessada via URL própria
export const NewsStandalone = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
      <NewsDisplay 
        className="w-full h-full"
        autoRotate={true}
        rotationInterval={25000} // 25 segundos
        showSource={true}
      />
    </div>
  );
};