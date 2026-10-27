# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 1. On-Device Privacy Guarantees

CheckmateAR is architected strictly as an **offline-first, zero-telemetry** application:

- **Local Video Processing**: All camera frames captured via `expo-camera` are processed in volatile memory on the local device solely for board corner detection, homography transformation, and piece classification.
- **Zero Remote Image Transmission**: Camera frames, extracted tile patches, and reconstructed board positions are **never** transmitted across the network.
- **Local Engine Execution**: Stockfish chess engine calculations and move evaluation run 100% locally on the device via the internal engine runtime.
- **Local AI Coach**: Tactical advice and natural language explanations are generated on-device using validated FEN positions and Stockfish calculations without external LLM API calls.
- **Encrypted Local Storage**: Saved study sessions and application preferences are persisted locally using device storage (`AsyncStorage`) and can be cleared at any time in Settings.

---

## 2. Reporting a Vulnerability

We take the security and privacy of our users seriously. If you discover a security vulnerability or privacy concern within CheckmateAR:

1. **Do not** disclose the vulnerability publicly in issues or pull requests.
2. Email a detailed report directly to: **parejasarronkian@gmail.com**
3. Please include:
   - A description of the issue and potential impact.
   - Steps to reproduce or a minimal proof-of-concept.
   - Your contact information for coordinated disclosure.
4. We acknowledge receipt within 48 hours and work with you on remediation before any public disclosure.
