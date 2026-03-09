import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useSSE(enabled: boolean = true) {
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let attempts = 0;

    function connect() {
      if (esRef.current) {
        esRef.current.close();
      }

      const es = new EventSource("/api/sse", { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        attempts = 0;
      };

      es.addEventListener("live-session-started", () => {
        qc.invalidateQueries({ queryKey: ["/api/play-sessions/active-live"] });
        qc.invalidateQueries({ queryKey: ["/api/play-sessions"] });
      });

      es.addEventListener("live-session-updated", () => {
        qc.invalidateQueries({ queryKey: ["/api/play-sessions/active-live"] });
      });

      es.addEventListener("live-session-ended", () => {
        qc.invalidateQueries({ queryKey: ["/api/play-sessions/active-live"] });
        qc.invalidateQueries({ queryKey: ["/api/play-sessions"] });
      });

      es.addEventListener("interrogation-started", () => {
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions"] });
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions/active"] });
      });

      es.addEventListener("interrogation-answered", () => {
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions"] });
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions/active"] });
      });

      es.addEventListener("interrogation-graded", () => {
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions"] });
        qc.invalidateQueries({ queryKey: ["/api/interrogation-sessions/active"] });
      });

      es.addEventListener("notification", () => {
        qc.invalidateQueries({ queryKey: ["/api/notifications"] });
        qc.invalidateQueries({ queryKey: ["/api/dashboard-init"] });
      });

      es.addEventListener("presence", () => {
        qc.invalidateQueries({ queryKey: ["/api/presence"] });
      });

      es.addEventListener("simulation-activated", () => {
        qc.invalidateQueries({ queryKey: ["/api/simulation/active"] });
        qc.invalidateQueries({ queryKey: ["/api/tasks"] });
        qc.invalidateQueries({ queryKey: ["/api/partner/tasks"] });
        qc.invalidateQueries({ queryKey: ["/api/rituals"] });
        qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
        qc.invalidateQueries({ queryKey: ["/api/dares"] });
        qc.invalidateQueries({ queryKey: ["/api/punishments"] });
        qc.invalidateQueries({ queryKey: ["/api/rewards"] });
        qc.invalidateQueries({ queryKey: ["/api/wagers"] });
        qc.invalidateQueries({ queryKey: ["/api/devotions"] });
        qc.invalidateQueries({ queryKey: ["/api/sealed-orders"] });
        qc.invalidateQueries({ queryKey: ["/api/countdown-events"] });
        qc.invalidateQueries({ queryKey: ["/api/endurance-challenges"] });
        qc.invalidateQueries({ queryKey: ["/api/obedience-trials"] });
        qc.invalidateQueries({ queryKey: ["/api/sensation-cards"] });
        qc.invalidateQueries({ queryKey: ["/api/accusations"] });
        qc.invalidateQueries({ queryKey: ["/api/desired-changes"] });
        qc.invalidateQueries({ queryKey: ["/api/confessions"] });
        qc.invalidateQueries({ queryKey: ["/api/aftercare-items"] });
        qc.invalidateQueries({ queryKey: ["/api/permission-requests"] });
        qc.invalidateQueries({ queryKey: ["/api/dashboard-init"] });
      });

      es.addEventListener("simulation-deactivated", () => {
        qc.invalidateQueries({ queryKey: ["/api/simulation/active"] });
        qc.invalidateQueries({ queryKey: ["/api/tasks"] });
        qc.invalidateQueries({ queryKey: ["/api/partner/tasks"] });
        qc.invalidateQueries({ queryKey: ["/api/rituals"] });
        qc.invalidateQueries({ queryKey: ["/api/standing-orders"] });
        qc.invalidateQueries({ queryKey: ["/api/dares"] });
        qc.invalidateQueries({ queryKey: ["/api/punishments"] });
        qc.invalidateQueries({ queryKey: ["/api/rewards"] });
        qc.invalidateQueries({ queryKey: ["/api/wagers"] });
        qc.invalidateQueries({ queryKey: ["/api/devotions"] });
        qc.invalidateQueries({ queryKey: ["/api/sealed-orders"] });
        qc.invalidateQueries({ queryKey: ["/api/countdown-events"] });
        qc.invalidateQueries({ queryKey: ["/api/endurance-challenges"] });
        qc.invalidateQueries({ queryKey: ["/api/obedience-trials"] });
        qc.invalidateQueries({ queryKey: ["/api/sensation-cards"] });
        qc.invalidateQueries({ queryKey: ["/api/accusations"] });
        qc.invalidateQueries({ queryKey: ["/api/desired-changes"] });
        qc.invalidateQueries({ queryKey: ["/api/confessions"] });
        qc.invalidateQueries({ queryKey: ["/api/aftercare-items"] });
        qc.invalidateQueries({ queryKey: ["/api/permission-requests"] });
        qc.invalidateQueries({ queryKey: ["/api/dashboard-init"] });
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;
        attempts++;
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, qc]);
}
