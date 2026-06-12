---
name: Protocol Version
description: protocolVersion field mapping (1.2.0 nexart-v1 frozen; 1.3.0 jcs-v1 RFC 8785 current); fail-closed on unknown versions
type: feature
---
`meta.attestation.protocolVersion` selects canonicalization profile.

- "1.2.0" -> profile "nexart-v1" (frozen, legacy, accepted indefinitely)
- "1.3.0" -> profile "jcs-v1" (RFC 8785, current default)
- unknown -> FAILED (fail-closed, no implicit fallback)

Both profiles MUST be supported by conformant verifiers. protocolVersion is part of
the attestation projection signed by the verification envelope (Layer 3), so it
cannot be silently retargeted without breaking signature verification.

## Out of scope (not guaranteed by verification)
- Completeness (capture is integration-dependent)
- Semantic correctness of model output
- Trusted timestamping (attestedAt is node-attested; external anchoring is roadmap)
- Deterministic replay (only meaningful in controlled model environments)
