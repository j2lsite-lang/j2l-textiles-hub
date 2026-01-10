import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, Pause, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatus {
  id: string;
  status: string;
  current_page: number;
  last_successful_page: number;
  products_count: number;
  page_retry_attempt: number;
  estimated_total_pages: number;
  started_at: string;
  heartbeat_at: string;
  error_message: string | null;
}

interface SyncProgressBarProps {
  onSyncComplete?: () => void;
}

export function SyncProgressBar({ onSyncComplete }: SyncProgressBarProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin role using the has_role function
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      setIsAdmin(data === true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  // Poll sync status
  useEffect(() => {
    if (!isAdmin) return;

    const fetchStatus = async () => {
      const { data } = await supabase
        .from('sync_status')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const prev = syncStatus;
        setSyncStatus(data as SyncStatus);
        
        // Notify on completion
        if (prev?.status === 'syncing' && data.status === 'completed') {
          onSyncComplete?.();
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s instead of 2s
    return () => clearInterval(interval);
  }, [isAdmin, onSyncComplete, syncStatus?.status]);

  if (loading || !isAdmin || !syncStatus) return null;

  const { status, current_page, products_count, estimated_total_pages, started_at, heartbeat_at, page_retry_attempt, error_message } = syncStatus;

  // Only show for active or recent syncs (within last 5 minutes)
  const completedAt = syncStatus.status === 'completed' ? new Date(heartbeat_at).getTime() : null;
  const isRecent = completedAt ? Date.now() - completedAt < 5 * 60 * 1000 : true;
  
  if (status === 'completed' && !isRecent) return null;
  if (status !== 'syncing' && status !== 'paused' && status !== 'completed' && status !== 'failed') return null;

  // Calculate progress
  const estimatedPages = estimated_total_pages || 500;
  const progressPercent = Math.min(99, Math.round((current_page / estimatedPages) * 100));
  const finalPercent = status === 'completed' ? 100 : progressPercent;

  // Calculate ETA
  const startTime = new Date(started_at).getTime();
  const elapsed = Date.now() - startTime;
  const pagesRemaining = estimatedPages - current_page;
  const msPerPage = current_page > 0 ? elapsed / current_page : 0;
  const etaMs = msPerPage * pagesRemaining;
  
  const formatEta = (ms: number) => {
    if (ms <= 0) return 'Terminé';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) return `~${minutes}m ${seconds}s`;
    return `~${seconds}s`;
  };

  // Status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'syncing': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'syncing': return 'Synchronisation en cours';
      case 'completed': return 'Synchronisation terminée';
      case 'failed': return 'Échec de la synchronisation';
      case 'paused': return 'Synchronisation en pause';
      default: return status;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">{getStatusText()}</span>
          {page_retry_attempt > 0 && status === 'syncing' && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
              Tentative {page_retry_attempt}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Page {current_page}/{estimatedPages}
          </span>
          <span className="font-semibold text-foreground">
            {finalPercent}%
          </span>
        </div>
      </div>

      <div className="relative mb-3">
        <Progress 
          value={finalPercent} 
          className={cn("h-3", status === 'failed' && "[&>div]:bg-red-500", status === 'paused' && "[&>div]:bg-yellow-500", status === 'completed' && "[&>div]:bg-green-500")} 
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{products_count.toLocaleString()} produits importés</span>
          {status === 'syncing' && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ETA: {formatEta(etaMs)}
            </span>
          )}
        </div>
        {error_message && status === 'failed' && (
          <span className="text-red-500 max-w-xs truncate" title={error_message}>
            {error_message}
          </span>
        )}
      </div>
    </div>
  );
}
