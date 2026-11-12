import { STAKEHOLDER_ROLES, type StakeholderRole } from "@/data/greenGridData";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface StakeholderRoleContextValue {
  role: StakeholderRole;
  setRoleId: (id: string) => void;
}

const StakeholderRoleContext =
  createContext<StakeholderRoleContextValue | null>(null);

const DEFAULT_ROLE_ID = "policymaker";

const FALLBACK_ROLE =
  STAKEHOLDER_ROLES.find((role) => role.id === DEFAULT_ROLE_ID) ??
  STAKEHOLDER_ROLES[0];

export function StakeholderRoleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [roleId, setRoleIdState] = useState<string>(DEFAULT_ROLE_ID);

  const setRoleId = useCallback((id: string) => {
    setRoleIdState(id);
  }, []);

  const value = useMemo<StakeholderRoleContextValue>(() => {
    const role =
      STAKEHOLDER_ROLES.find((candidate) => candidate.id === roleId) ??
      STAKEHOLDER_ROLES[0];
    return { role, setRoleId };
  }, [roleId, setRoleId]);

  return (
    <StakeholderRoleContext.Provider value={value}>
      {children}
    </StakeholderRoleContext.Provider>
  );
}

/**
 * Reads the active stakeholder role. Outside a provider (for example when a
 * page is rendered in isolation) it falls back to the default role and a no-op
 * setter so the page still renders.
 */
export function useStakeholderRole(): StakeholderRoleContextValue {
  const context = useContext(StakeholderRoleContext);
  if (context) return context;
  return { role: FALLBACK_ROLE, setRoleId: () => {} };
}
