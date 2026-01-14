import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface SyncResult {
  sku: string;
  success: boolean;
  shopifyId?: number;
  error?: string;
}

export default function AdminShopifySync() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<SyncResult[]>([]);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const TOTAL_PRODUCTS = 2958;
  const BATCH_SIZE = 3; // Small batch to avoid timeout

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const syncBatch = async (offset: number): Promise<{ success: boolean; results: SyncResult[] }> => {
    try {
      const { data, error } = await supabase.functions.invoke("shopify-sync", {
        body: { offset, limit: BATCH_SIZE },
      });

      if (error) throw error;
      return { success: true, results: data.results || [] };
    } catch (err) {
      addLog(`❌ Erreur batch ${offset}: ${err}`);
      return { success: false, results: [] };
    }
  };

  const startSync = async () => {
    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;
    
    addLog("🚀 Démarrage de la synchronisation...");

    let offset = currentOffset;
    
    while (offset < TOTAL_PRODUCTS && !abortRef.current) {
      // Check for pause
      while (pauseRef.current && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (abortRef.current) break;

      addLog(`📦 Traitement des produits ${offset + 1} à ${Math.min(offset + BATCH_SIZE, TOTAL_PRODUCTS)}...`);
      
      const { success, results: batchResults } = await syncBatch(offset);
      
      if (success) {
        batchResults.forEach((result: SyncResult) => {
          setResults(prev => [result, ...prev.slice(0, 199)]);
          if (result.success) {
            setSuccessCount(prev => prev + 1);
            addLog(`✅ ${result.sku} → Shopify ID: ${result.shopifyId}`);
          } else {
            setErrorCount(prev => prev + 1);
            addLog(`❌ ${result.sku}: ${result.error}`);
          }
        });
        
        offset += BATCH_SIZE;
        setCurrentOffset(offset);
        setTotalProcessed(prev => prev + batchResults.length);
      } else {
        // Wait before retry
        addLog("⏳ Attente avant nouvelle tentative...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (abortRef.current) {
      addLog("⏹️ Synchronisation arrêtée");
    } else {
      addLog("🎉 Synchronisation terminée!");
    }
    
    setIsRunning(false);
  };

  const pauseSync = () => {
    pauseRef.current = true;
    setIsPaused(true);
    addLog("⏸️ Synchronisation en pause");
  };

  const resumeSync = () => {
    pauseRef.current = false;
    setIsPaused(false);
    addLog("▶️ Reprise de la synchronisation");
  };

  const stopSync = () => {
    abortRef.current = true;
    pauseRef.current = false;
    setIsPaused(false);
    addLog("⏹️ Arrêt demandé...");
  };

  const resetSync = () => {
    setCurrentOffset(0);
    setTotalProcessed(0);
    setSuccessCount(0);
    setErrorCount(0);
    setLogs([]);
    setResults([]);
    addLog("🔄 Reset effectué");
  };

  const progress = (currentOffset / TOTAL_PRODUCTS) * 100;
  const estimatedTimeRemaining = Math.ceil(((TOTAL_PRODUCTS - currentOffset) / BATCH_SIZE) * 4 / 60);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Migration TopTex → Shopify</CardTitle>
          <CardDescription>
            Synchronisation de {TOTAL_PRODUCTS} produits vers votre boutique Shopify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression: {currentOffset} / {TOTAL_PRODUCTS}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            {isRunning && (
              <p className="text-sm text-muted-foreground">
                Temps estimé restant: ~{estimatedTimeRemaining} minutes
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{totalProcessed}</p>
                <p className="text-sm text-muted-foreground">Traités</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-sm text-muted-foreground">Succès</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Erreurs</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            {!isRunning ? (
              <Button onClick={startSync} className="gap-2">
                <Play className="h-4 w-4" />
                {currentOffset > 0 ? "Reprendre" : "Démarrer"}
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button onClick={pauseSync} variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeSync} className="gap-2">
                    <Play className="h-4 w-4" />
                    Reprendre
                  </Button>
                )}
                <Button onClick={stopSync} variant="destructive" className="gap-2">
                  Arrêter
                </Button>
              </>
            )}
            <Button onClick={resetSync} variant="ghost" disabled={isRunning}>
              Reset
            </Button>
          </div>

          {/* Logs */}
          <div>
            <h3 className="font-semibold mb-2">Journal</h3>
            <ScrollArea className="h-48 border rounded-md p-3 bg-muted/50">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Cliquez sur "Démarrer" pour lancer la migration...
                </p>
              ) : (
                <div className="space-y-1 font-mono text-xs">
                  {logs.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Recent results */}
          {results.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Derniers produits</h3>
              <ScrollArea className="h-32 border rounded-md">
                <div className="p-2 space-y-1">
                  {results.slice(0, 20).map((result, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant="outline">{result.sku}</Badge>
                      {result.success && (
                        <span className="text-muted-foreground">
                          ID: {result.shopifyId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
