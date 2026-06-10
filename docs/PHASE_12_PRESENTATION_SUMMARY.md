# Customer Insight Dashboard Presentation Summary

## Problem

The dashboard had grown into a broad operational surface with several competing mental models: raw revenue reporting, risk/growth tracking, map monitoring, user access, and historical export/report paths. Users needed a clearer way to understand customer risk, customer growth, and follow-up work by role without exposing data outside scope.

## Solution

The final direction is `Customer Insight Dashboard`: a role-scoped customer operations workspace.

- BD users focus on their own follow-up queue and customer actions.
- AM users see scoped team progress and zone workload.
- Directors see national/zone-level risk, growth, and action focus.
- Map areas use a composite `Map Score`, not only raw totals.
- Follow-up language replaces standalone `Tracking` wording in user-facing surfaces.
- Login and loading states now explain role scope, customer signals, and follow-up readiness.

## Result

The system now presents a cleaner end-to-end story:

- Login: secure access to a customer insight workspace.
- Home: role-first overview and map focus.
- Risk/Growth: actionable follow-up work cards.
- Map: score-based recovery/opportunity signals with carrier movement.
- User management: Director-only online/last active visibility.
- Docs: Phase 11 closure and Phase 12 readiness notes.

## Benefit

- Less ambiguity for BD/AM/Director users.
- Better confidence that visible data respects scope.
- Follow-up work is easier to prioritize.
- Current-month comparisons use normalized/day-based signals.
- The product is closer to presentation and handoff readiness.

## Guardrails

- Raw KPI sheets remain untouched.
- Export/download/report disabled paths remain disabled.
- Role permission and masking are preserved.
- Phase 10.6-10.23 cache/prepared-payload complexity was not reintroduced.
