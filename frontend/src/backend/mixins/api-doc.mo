mixin () {
  public query func getApiDoc() : async Text {
    "# India Green Grid — Backend API\n\n" #
    "## Purpose\n\n" #
    "This canister is the backend for India Green Grid, a role-based decision-support platform for India's " #
    "energy transition. The current backend is intentionally minimal: it provides the authorization layer " #
    "and the Object Query Layer (OQL) surface. All dashboard content (energy mix, RPO compliance, solar ROI, " #
    "jobs, finance, circularity, impact and forecasting) is illustrative static sample data rendered by the " #
    "frontend; the canister does not yet store or compute those datasets.\n\n" #
    "## Authentication and identity\n\n" #
    "Authentication uses Internet Identity. The frontend pins an Internet Identity derivation origin, " #
    "published at `/.well-known/ii-derivation-origin` when available. An agent that already holds the user's " #
    "Internet Identity authorization derives the correct per-app principal against that origin (for example " #
    "`icp identity link web <name> --app <host>`). Such a delegation acts with the user's full authority in " #
    "this app until it expires.\n\n" #
    "Registration is a prerequisite for role-guarded calls. A caller registers by calling " #
    "`_initialize_access_control` once as a signed-in (non-anonymous) caller. The first principal to " #
    "initialize becomes `#admin`; every later principal becomes `#user`. Anonymous callers are ignored by " #
    "registration and remain unregistered. A principal that never signed in through this app's own frontend " #
    "is unregistered even if it belongs to the app owner, and a principal derived against a different " #
    "derivation origin is a different principal than the one the frontend registered.\n\n" #
    "## Authorization\n\n" #
    "Roles are `#admin`, `#user` and `#guest`. `getCallerUserRole` returns `#guest` for an anonymous caller " #
    "and traps with `User is not registered` for a signed-in caller that has not registered. " #
    "`isCallerAdmin` returns `false` for anonymous and unregistered callers. `assignCallerUserRole` is " #
    "admin-only and traps with `Unauthorized: Only admins can assign user roles` for any non-admin caller.\n\n" #
    "## Methods\n\n" #
    "- `_internet_identity_sign_in_start() : async Blob` — issues an Internet Identity challenge.\n" #
    "- `_internet_identity_sign_in_finish() : async Result<(), Error>` — completes sign-in, registers the " #
    "caller, and returns `#ok` or `#err`.\n" #
    "- `_initialize_access_control() : async ()` — registers the caller; first caller becomes admin.\n" #
    "- `getCallerUserRole() : async UserRole` — query; the caller's role.\n" #
    "- `isCallerAdmin() : async Bool` — query; whether the caller is an admin.\n" #
    "- `assignCallerUserRole(user : Principal, role : UserRole) : async ()` — admin-only role assignment.\n" #
    "- `schema() : async Text` — OQL; the queryable schema. No entities are currently registered, so it " #
    "reports an empty entity list.\n" #
    "- `execute(query : Text) : async Text` — OQL; runs a JSON query against registered entities. With no " #
    "entities registered, no rows are returned.\n" #
    "- `getApiDoc() : async Text` — query; this document.\n\n" #
    "## Units and encoding\n\n" #
    "Principals are Candid `Principal` values; roles are the variant `{ #admin; #user; #guest }`. OQL " #
    "`schema` and `execute` exchange JSON text. No timestamps, numeric units or blobs are currently " #
    "persisted by this canister.\n\n" #
    "## Lifecycle and polling\n\n" #
    "Sign-in is a two-step flow: call `_internet_identity_sign_in_start` to obtain a challenge, then " #
    "`_internet_identity_sign_in_finish` to complete it. Registration is idempotent — calling " #
    "`_initialize_access_control` again for an already-registered caller is a no-op. There is no background " #
    "job or asynchronous state transition to poll.\n\n" #
    "## Mutation retry safety\n\n" #
    "`_initialize_access_control` is safe to retry: it never changes an existing caller's role. " #
    "`assignCallerUserRole` is idempotent for a given `(user, role)` pair. `_internet_identity_sign_in_finish` " #
    "consumes a challenge and should not be retried with a stale challenge.\n\n" #
    "## Errors and gotchas\n\n" #
    "`getCallerUserRole` traps for an unregistered signed-in caller; register first. `assignCallerUserRole` " #
    "traps for non-admins. Anonymous callers cannot register and always read as `#guest`. Because the " #
    "frontend is a static design prototype, no dashboard data is served by this canister — OQL queries " #
    "return no rows until entities are registered.";
  };
};
