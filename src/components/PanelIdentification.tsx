import { PanelIdentification as PanelId } from '@/types/order';

interface PanelIdentificationProps {
  panel: PanelId;
}

export const PanelIdentification = ({ panel }: PanelIdentificationProps) => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="text-sm">
          <span className="font-semibold text-primary">Painel {panel.id}</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-foreground">{panel.name}</span>
          {panel.location && (
            <>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-muted-foreground text-xs">{panel.location}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};