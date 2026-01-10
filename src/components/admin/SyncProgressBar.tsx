import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, Pause, Clock, Database, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatus {
  id: string;
  status: string;
  current_page: number;
  last_successful_page: number;
  products_count: number;
  page_retry_attempt: number;
  estimated_total_pages: number | null;
  started_at: string;
  heartbeat_at: string;
  completed_at: string | null;
  error_message: string | null;
  eta: string | null;
  finished_in_ms: number | null;
  download_bytes: number | null;
}

interface SyncProgressBarProps {
  onSyncComplete?: () => void;
}

export function SyncProgressBar({ onSyncComplete }: SyncProgressBarProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbProductCount, setDbProductCount] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      setIsAdmin(data === true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  // Fetch initial sync status and set up realtime subscription
  useEffect(() => {
    if (!isAdmin) return;

    // Initial fetch
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('sync_status')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setSyncStatus(data as SyncStatus);
      }

      // Also get current product count in DB
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      setDbProductCount(count);
    };

    fetchStatus();

    // Subscribe to realtime changes on sync_status table
    const channel = supabase
      .channel('sync-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_status'
        },
        (payload) => {
          const newData = payload.new as SyncStatus;
          if (newData) {
            setSyncStatus(prev => {
              // Notify on completion
              if (prev?.status === 'syncing' && newData.status === 'completed') {
                onSyncComplete?.();
              }
              return newData;
            });
          }
        }
      )
      .subscribe();

    // Also poll product count every 10s during active sync
    const productCountInterval = setInterval(async () => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      setDbProductCount(count);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(productCountInterval);
    };
  }, [isAdmin, onSyncComplete]);

  if (loading || !isAdmin || !syncStatus) return null;

  const { 
    status, 
    current_page, 
    products_count, 
    estimated_total_pages, 
    started_at, 
    heartbeat_at, 
    page_retry_attempt, 
    error_message,
    eta,
    finished_in_ms,
    completed_at
  } = syncStatus;

  // Only show for active or recent syncs (within last 5 minutes)
  const completedTime = completed_at ? new Date(completed_at).getTime() : null;
  const isRecent = completedTime ? Date.now() - completedTime < 5 * 60 * 1000 : true;
  
  if (status === 'completed' && !isRecent) return null;
  if (!['syncing', 'paused', 'completed', 'failed', 'starting', 'waiting_s3'].includes(status)) return null;

  // Calculate progress
  const estimatedPages = estimated_total_pages || 500;
  const progressPercent = Math.min(99, Math.round((current_page / estimatedPages) * 100));
  const finalPercent = status === 'completed' ? 100 : progressPercent;

  // Parse ETA from database or calculate
  const formatEta = (etaStr: string | null, startedAt: string, currentPage: number, estPages: number) => {
    if (etaStr) {
      const etaDate = new Date(etaStr);
      const now = Date.now();
      const remainingMs = etaDate.getTime() - now;
      if (remainingMs <= 0) return 'Bientôt...';
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      if (minutes > 0) return `~${minutes}m ${seconds}s`;
      return `~${seconds}s`;
    }
    
    // Fallback calculation
    const startTime = new Date(startedAt).getTime();
    const elapsed = Date.now() - startTime;
    const pagesRemaining = estPages - currentPage;
    const msPerPage = currentPage > 0 ? elapsed / currentPage : 0;
    const etaMs = msPerPage * pagesRemaining;
    
    if (etaMs <= 0) return 'Terminé';
    const minutes = Math.floor(etaMs / 60000);
    const seconds = Math.floor((etaMs % 60000) / 1000);
    if (minutes > 0) return `~${minutes}m ${seconds}s`;
    return `~${seconds}s`;
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return null;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'waiting_s3': return <Clock className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'starting': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'syncing': return 'Synchronisation en cours';
      case 'completed': return 'Synchronisation terminée';
      case 'failed': return 'Échec de la synchronisation';
      case 'paused': return 'Synchronisation en pause';
      case 'waiting_s3': return 'Attente du fichier S3...';
      case 'starting': return 'Démarrage...';
      default: return status;
    }
  };

  // Time since heartbeat
  const heartbeatTime = new Date(heartbeat_at).getTime();
  const secondsSinceHeartbeat = Math.round((Date.now() - heartbeatTime) / 1000);
  const isStale = secondsSinceHeartbeat > 60;

  return (
    <div className={cn(
      "bg-card border rounded-lg p-4 mb-6 shadow-sm",
      status === 'completed' ? "border-green-200 bg-green-50/50" : 
      status === 'failed' ? "border-red-200 bg-red-50/50" : 
      status === 'paused' ? "border-yellow-200 bg-yellow-50/50" : 
      "border-border"
    )}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">{getStatusText()}</span>
          {page_retry_attempt > 0 && status === 'syncing' && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
              Tentative {page_retry_attempt}
            </span>
          )}
          {isStale && status === 'syncing' && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
              Signal: {secondsSinceHeartbeat}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            Page {current_page}/{estimated_total_pages || '~500'}
          </span>
          <span className="font-semibold text-foreground">
            {finalPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-3">
        <Progress 
          value={finalPercent} 
          className={cn(
            "h-3",
            status === 'failed' && "[&>div]:bg-red-500",
            status === 'paused' && "[&>div]:bg-yellow-500",
            status === 'completed' && "[&>div]:bg-green-500"
          )} 
        />
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {/* Products imported during sync */}
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {products_count.toLocaleString()} produits importés
          </span>
          
          {/* Total products in DB */}
          {dbProductCount !== null && (
            <span className="text-foreground font-medium">
              Total DB: {dbProductCount.toLocaleString()}
            </span>
          )}
          
          {/* ETA */}
          {status === 'syncing' && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ETA: {formatEta(eta, started_at, current_page, estimatedPages)}
            </span>
          )}
          
          {/* Duration for completed */}
          {status === 'completed' && finished_in_ms && (
            <span className="text-green-600">
              Terminé en {formatDuration(finished_in_ms)}
            </span>
          )}
        </div>
        
        {/* Error message */}
        {error_message && status === 'failed' && (
          <span className="text-red-500 max-w-xs truncate" title={error_message}>
            {error_message}
          </span>
        )}
      </div>
    </div>
  );
}
