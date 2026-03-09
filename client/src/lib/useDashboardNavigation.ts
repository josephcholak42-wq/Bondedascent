import { useState, useEffect, useRef, useCallback } from "react";

type OverlayType = "live-session" | "interrogation" | "confession-booth" | "aftercare" | null;

export function useDashboardNavigation() {
  const [activeView, setActiveView] = useState("dashboard");
  const [modal, setModal] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [interrogationPhase, setInterrogationPhase] = useState("setup");

  const activeOverlayRef = useRef(activeOverlay);
  const modalRef = useRef(modal);
  const activeViewRef = useRef(activeView);

  useEffect(() => { activeOverlayRef.current = activeOverlay; }, [activeOverlay]);
  useEffect(() => { modalRef.current = modal; }, [modal]);
  useEffect(() => { activeViewRef.current = activeView; }, [activeView]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state?.dashboardNav) {
        setActiveOverlay(state.activeOverlay || null);
        setModal(state.modal || null);
        setActiveView(state.activeView || "dashboard");
        if (state.interrogationPhase) setInterrogationPhase(state.interrogationPhase);
      } else {
        setActiveOverlay(null);
        setModal(null);
        setActiveView("dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateView = useCallback((view: string) => {
    window.history.pushState({ dashboardNav: true, activeView: view, modal: null, activeOverlay: null }, "");
    setActiveView(view);
  }, []);

  const openModal = useCallback((m: string | null) => {
    if (m) {
      window.history.pushState({ dashboardNav: true, activeView: activeViewRef.current, modal: m, activeOverlay: null }, "");
    }
    setModal(m);
  }, []);

  const openOverlay = useCallback((overlay: OverlayType) => {
    if (overlay) {
      window.history.pushState({ dashboardNav: true, activeView: activeViewRef.current, modal: null, activeOverlay: overlay }, "");
    }
    setActiveOverlay(overlay);
  }, []);

  const closeOverlay = useCallback(() => {
    if (window.history.state?.dashboardNav && window.history.state?.activeOverlay) {
      window.history.back();
    } else {
      setActiveOverlay(null);
    }
  }, []);

  const closeModal = useCallback(() => {
    if (window.history.state?.dashboardNav && window.history.state?.modal) {
      window.history.back();
    } else {
      setModal(null);
    }
  }, []);

  return {
    activeView,
    setActiveView,
    modal,
    setModal,
    activeOverlay,
    setActiveOverlay,
    interrogationPhase,
    setInterrogationPhase,
    activeOverlayRef,
    modalRef,
    activeViewRef,
    navigateView,
    openModal,
    openOverlay,
    closeOverlay,
    closeModal,
  };
}
