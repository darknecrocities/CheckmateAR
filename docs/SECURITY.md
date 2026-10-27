# Security Policy

For the primary security policy, see [SECURITY.md](../SECURITY.md) in the project root.

## Architecture Threat Model Summary

1. **Camera Sensor Ingestion**:
   - Frames are ingested via Expo Camera API.
   - Buffer memory is freed immediately upon calculation of homography and tile matrices.
   - No filesystem frame dumping without user-initiated export.

2. **Injection Defense**:
   - FEN strings are parsed and validated through `chess.js` before being passed to the Stockfish engine.
   - Malformed or adversarial FEN inputs are intercepted and rejected with structured error states, preventing buffer overflows or engine corruption.

3. **Data Storage Integrity**:
   - Storage keys are namespace-scoped (`@checkmatear_study_sessions_v1`, `@checkmatear_settings_v1`).
   - All session JSON payloads undergo schema verification upon reading.
