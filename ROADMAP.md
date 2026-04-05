# Evercrafted Completion Roadmap

## Phase 1 (Now): Backend hardening foundations
- [x] Add a practical implementation roadmap so delivery is trackable.
- [x] Add Firebase-auth verification middleware in the Express server.
- [x] Replace placeholder project API routes with real Firestore-backed behavior.
- [x] Add request payload validation for all AI endpoints.
- [x] Add per-route rate limiting and basic abuse protection.

## Phase 2: Payments + entitlement reliability
- [ ] Replace in-memory purchase tracking with durable storage.
- [ ] Add Stripe webhook processing (`checkout.session.completed`, refunds, disputes).
- [ ] Add idempotency for checkout and entitlement updates.
- [ ] Add audit logging for purchase and download actions.

## Phase 3: Async jobs + media pipeline
- [ ] Move motion generation to a background queue worker.
- [ ] Add job status endpoints and retry policies.
- [ ] Add signed URL lifecycle management and expiration strategy.

## Phase 4: App modularization for adding more "apps"
- [ ] Split `server.ts` into feature routers (`blueprints`, `motion`, `projects`, `payments`).
- [ ] Create a shared middleware layer (`auth`, `validation`, `error handling`).
- [x] Add feature flags / app registry to enable apps per tier.
- [ ] Publish a contributor guide for adding a new app end-to-end.

## Phase 5: Ops and quality
- [ ] Add API integration tests for critical workflows.
- [ ] Add structured logging and monitoring dashboards.
- [ ] Add environment validation at startup (required keys, bucket, base URLs).
- [ ] Review and tighten Firestore/Storage security rules by collection.
